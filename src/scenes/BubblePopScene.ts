import Phaser from 'phaser';
import { SceneName } from '../constants';
import { createColorFactory, getRandomIntInclusive, spliceRandom } from '../util';
type GameObject = Phaser.GameObjects.GameObject;
type Sprite = Phaser.GameObjects.Sprite;
type Pointer = Phaser.Input.Pointer;
type Text = Phaser.GameObjects.Text;

export default class BubblePopScene extends Phaser.Scene {
    constructor() {
        super(SceneName.BubblePopScene);
    }

    /**
     * The percent of the entire window each bubble should be
     */
    private bubbleSize = 150;

    preload() {
        console.log('preload bubble scene');
        this.load.image('bubble', 'assets/images/bubble.png');

        this.load.audio('pop', 'assets/audio/pop.mp3').once('filecomplete-audio-pop', (key: string) => {
            console.log('pop sound loaded');
            this.popSound = this.sound.add(key);
        });

        this.load.audio('victory', ['assets/audio/sparkle.mp3']).once('filecomplete-audio-victory', () => {
            console.log('victory sound loaded');
            this.victorySound = this.sound.add('victory');
        });

    }

    create() {
        console.log('create bubble scene');
        this.addBackButton();
        this.computeSizing();

        const group = this.add.group();

        const maxBubblesHoriz = Math.floor(this.gameWidth / this.bubbleSize);
        const maxBubblesVert = Math.floor(this.gameHeight / this.bubbleSize);

        for (let i = 0; i < maxBubblesHoriz * maxBubblesVert; i++) {
            group.add(
                this.createBubble(0, 0)
            );
        }

        Phaser.Actions.GridAlign(group.getChildren(), {
            width: maxBubblesHoriz,
            height: maxBubblesVert,
            position: Phaser.Display.Align.CENTER,
            cellWidth: this.bubbleSize,
            cellHeight: this.bubbleSize,
            x: this.bubbleSize / 2,
            y: this.bubbleSize / 2
        });
    }

    finalize() {
        this.victorySound?.play();
        this.addPlayAgainButton();
    }

    private backButton!: Text;

    private popSound!: Phaser.Sound.BaseSound;
    private victorySound!: Phaser.Sound.BaseSound;
    private colorFactory = createColorFactory();

    private bubbleWidth = 0;
    private bubbleHeight = 0;

    private get gameWidth() {
        return this.scale.gameSize.width;
    }
    private get gameHeight() {
        return this.scale.gameSize.height;
    }

    private bubbles = new Set<Sprite>();

    private popBubble(bubble: Sprite) {
        bubble.setOrigin(.5, .5);
        // bubble.destroy();
        this.popSound?.play();
        bubble.tint = 0xFFFFFF;
        bubble.tintFill = true;
        this.tweens.add({
            targets: bubble,
            scaleX: 0,
            scaleY: 0,
            ease: 'Sine.easeInOut',
            duration: 100,
            onComplete: () => {
                bubble.destroy();
                this.bubbles.delete(bubble);
                if (this.bubbles.size === 0) {
                    this.finalize();
                }
            }
        })
    }

    private createBubble(x: number, y: number) {
        const bubble = this.make.sprite({
            key: 'bubble'
        });
        bubble.displayWidth = this.bubbleSize
        bubble.displayHeight = this.bubbleSize;
        bubble.tint = this.colorFactory();
        bubble.setPosition(x, y);
        bubble.setInteractive();
        bubble.once('pointerdown', () => {
            this.popBubble(bubble);
        });
        this.bubbles.add(bubble);
        this.tweens.add({
            targets: bubble,
            props: {
                x: { value: '+=3', duration: getRandomIntInclusive(800, 1150), delay: getRandomIntInclusive(1, 1000), ease: 'Sine.easeInOut' },
                y: { value: '+=3', duration: getRandomIntInclusive(800, 1150), delay: getRandomIntInclusive(1, 1000), ease: 'Sine.easeInOut' },
                scaleX: { value: '+=.005', duration: 4000, ease: 'Sine.easeInOut' },
                scaleY: { value: '+=.005', duration: 4000, ease: 'Sine.easeInOut' }
            },
            repeat: -1,
            yoyo: true
        });
        return bubble;
    }

    private computeSizing() {
        const bubble = this.createBubble(0, 0);
        this.bubbleWidth = bubble.displayWidth;
        this.bubbleHeight = bubble.displayHeight;
        bubble.destroy();
        this.bubbles.delete(bubble);
    }

    private addBackButton() {
        this.backButton = this.add.text(10, 10, '←', { fontSize: '48px', color: 'white' })
            .setOrigin(0)
            .setPadding(20, 0, 20, 10)
            .setStyle({ backgroundColor: '#111' })
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.scene.restart();
                this.scene.switch(SceneName.TitleScene);
            })
            .setDepth(10)
            .on('pointerover', () => this.backButton.setStyle({ fill: '#f39c12' }))
            .on('pointerout', () => this.backButton.setStyle({ fill: '#FFF' }))
    }

    private addPlayAgainButton() {
        var playAgain = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'Play Again', { fontSize: '48px', color: 'white' })
            .setOrigin(.5)
            .setPadding(50)
            .setResolution(10)
            .setStyle({ backgroundColor: 'green' })
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.scene.restart();
            })
            .setDepth(10)
            .on('pointerover', () => playAgain.setStyle({ fill: '#f39c12' }))
            .on('pointerout', () => playAgain.setStyle({ fill: '#FFF' }))
        //TODO show an in-game button or something
    }

}