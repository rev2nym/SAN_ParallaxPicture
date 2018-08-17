//=============================================================================
// SAN_ParallaxPicture.js
//=============================================================================
// Copyright (c) 2017 Sanshiro
// Released under the MIT license
// http://opensource.org/licenses/mit-license.php
//=============================================================================

/*:
 * @plugindesc パララックスピクチャ ver1.0.2
 * ピクチャを遠景風にスクロール表示します。
 * @author サンシロ https://twitter.com/rev2nym
 * @version 1.0.2 2018/02/17 競合対策。
 * 1.0.1 2017/08/06 コメント修正。
 * 1.0.0 2017/08/03 リファクタリング。
 * 0.0.1 2017/08/01 作成。
 * 
 * @help
 * ■概要
 * ピクチャを遠景風にスクロール表示します。
 * 
 * ■画像ファイル
 * 使用する画像ファイルは「img\pictures」フォルダに配置してください。
 * ゲーム画面より大きな画像を使用してください。
 * 
 * ■ピクチャ機能との関係と使用上の注意
 * パララックスピクチャはコアスクリプトのピクチャ機能を流用しています。
 * 1層のパララックスを表示するために4枚のピクチャを使用します。
 * 例えばパララックスの表示にID:5を指定した場合
 * ピクチャのID:5からID:8までを占有します。
 * パララックスの表示中はそれらのピクチャを操作しないでください。
 * 
 * ■スクリプトコマンド
 * このプラグインには以下の機能とスクリプトコマンドを実装しています。
 * 
 * ・パララックスの表示
 *   $gameScreen.showParallax(
 *       pictureId, // ピクチャID
 *       name,      // 画像ファイル名(拡張子なし)
 *       opacity,   // 不透明度(0から255)
 *       blendMode  // 合成方法(0:通常 1:加算 2:乗算 3:スクリーン)
 *   );
 * 
 * ・パララックスのフェード
 *   $gameScreen.fadeParallax(
 *       pictureId,     // ピクチャID
 *       targetOpacity, // 目標不透明度(0から255)
 *       fadeSpeed      // 不透明度変化速度
 *   );
 * 
 * ・パララックスのスクロール
 *   $gameScreen.scrollParallax(
 *       pictureId, // ピクチャID
 *       speedX,    // X方向スクロール速度
 *       speedY     // Y方向スクロール速度
 *   );
 *
 * ・パララックスの染色
 *   $gameScreen.fadeParallax(
 *       pictureId, // ピクチャID
 *       tone,      // 色調配列([R, G, B, gray])
 *       duration   // 染色完了までのフレーム数
 *   );
 * 
 * ・パララックスの削除
 *   $gameScreen.eraseParallax(
 *       pictureId  // ピクチャID
 *   );
 *
 * ■利用規約
 * MITライセンスのもと、商用利用、改変、再配布が可能です。
 * ただし冒頭のコメントは削除や改変をしないでください。
 * よかったらクレジットに作者名を記載してください。
 * 
 * これを利用したことによるいかなる損害にも作者は責任を負いません。
 * サポートは期待しないでください＞＜。
 */

var Imported = Imported || {};
Imported.SAN_ParallaxPicture = true;

var Sanshiro = Sanshiro || {};
Sanshiro.ParallaxPicture = Sanshiro.ParallaxPicture || {};
Sanshiro.ParallaxPicture.version = '1.0.2';

(function() {
'use strict';

//-----------------------------------------------------------------------------
// Game_Screen
//
// スクリーン

// ピクチャオブジェクトリスト
Game_Screen.prototype.pictures = function() {
    return this._pictures;
};

// パララックス位置基準ピクチャオブジェクト判定
Game_Screen.prototype.isParallaxBasePicture = function(pictureId) {
    var picture = this.picture(pictureId);
    return (
        !!picture &&
        picture.isParallaxBase()
    );
};

// パララックスの表示
Game_Screen.prototype.showParallax = function(pictureId, name, opacity, blendMode) {
    var origin = 0;
    var x = 0;
    var y = 0;
    var scaleX = 100;
    var scaleY = 100;
    for (var i = 0; i < 4; i++) {
        var realPictureId = this.realPictureId(pictureId + i);
        var picture = new Game_Picture();
        picture.setParallax(true);
        picture.setParallaxIndex(i);
        picture.show(
            name, 
            origin, 
            x,
            y,
            scaleX,
            scaleY,
            opacity,
            blendMode
        );
        this._pictures[realPictureId] = picture;
    }
};

// パララックスのフェード
Game_Screen.prototype.fadeParallax = function(pictureId, targetOpacity, fadeSpeed) {
    if (this.isParallaxBasePicture(pictureId)) {
        for (var i = 0; i < 4; i++) {
            var picture = this.picture(pictureId + i);
            picture.fadeParallax(targetOpacity, fadeSpeed);
        }
    }
};

// パララックスのスクロール
Game_Screen.prototype.scrollParallax = function(pictureId, speedX, speedY) {
    if (this.isParallaxBasePicture(pictureId)) {
        for (var i = 0; i < 4; i++) {
            var picture = this.picture(pictureId + i);
            picture.scrollParallax(speedX, speedY);
        }
    }
};

// パララックスの染色
Game_Screen.prototype.tintParallax = function(pictureId, tone, duration) {
    if (this.isParallaxBasePicture(pictureId)) {
        for (var i = 0; i < 4; i++) {
            var picture = this.picture(pictureId + i);
            picture.tintParallax(tone, duration);
        }
    }
};

// パララックスの削除
Game_Screen.prototype.eraseParallax = function(pictureId) {
    if (this.isParallaxBasePicture(pictureId)) {
        for (var i = 0; i < 4; i++) {
            this.erasePicture(pictureId + i);
        }
    }
};

//-----------------------------------------------------------------------------
// Game_Picture
//
// ピクチャ

// オブジェクト初期化
var _Game_Picture_initialize =
    Game_Picture.prototype.initialize;
Game_Picture.prototype.initialize = function() {
    _Game_Picture_initialize.call(this);
    this.initParallax();
};

// パララックスの初期化
Game_Picture.prototype.initParallax = function() {
    this._parallax = false; // パララックスフラグ
    this._parallaxIndex = 0; // インデックス
    this._parallaxWidth = 0; // ビットマップ幅
    this._parallaxHeight = 0; // ビットマップ高さ
    this._parallaxScroll = false; // スクロールフラグ
    this._parallaxScrollSpeedX = 0.0; // Xスクロール速度
    this._parallaxScrollSpeedY = 0.0; // Yスクロール速度
    this._parallaxFadeSpeed = 0; // フェード速度
    this._parallaxTargetOpacity = 0; // 目標不透明度
};

// ピクチャID
Game_Picture.prototype.pictureId = function() {
    if ($gameParty.inBattle()) {
        return $gameScreen.pictures().indexOf(this) - $gameScreen.maxPictures();
    } else {
        return $gameScreen.pictures().indexOf(this);
    }
};

// ビットマップサイズの設定
Game_Picture.prototype.setParallaxSize = function(width, height) {
    this._parallaxWidth = width;
    this._parallaxHeight = height;
};

// ビットマップ幅
Game_Picture.prototype.parallaxWidth = function() {
    return this._parallaxWidth;
};

// ビットマップ高さ
Game_Picture.prototype.parallaxHeight = function() {
    return this._parallaxHeight;
};

// パララックス位置基準ピクチャ判定
Game_Picture.prototype.isParallaxBase = function() {
    return this._parallax && this._parallaxIndex === 0;
};

// パララックスフラグの設定
Game_Picture.prototype.setParallax = function(parallax) {
    this._parallax = parallax;
};

// パララックスインデックスの設定
Game_Picture.prototype.setParallaxIndex = function(parallaxIndex) {
    this._parallaxIndex = parallaxIndex;
};

// パララックス位置基準ピクチャ
Game_Picture.prototype.parallaxBasePicture = function() {
    return $gameScreen.picture(this.pictureId() - this._parallaxIndex);
};

// パララックスフェード
Game_Picture.prototype.fadeParallax = function(targetOpacity, fadeSpeed) {
    this._parallaxTargetOpacity = targetOpacity;
    this._parallaxFadeSpeed = Math.abs(fadeSpeed);
};

// パララックススクロール
Game_Picture.prototype.scrollParallax = function(speedX, speedY) {
    this.initTarget();
    this.initRotation();
    this._parallaxScrollSpeedX = speedX;
    this._parallaxScrollSpeedY = speedY;
    this._parallaxScroll = (
        this._parallaxScrollSpeedX !== 0.0 ||
        this._parallaxScrollSpeedY !== 0.0
    );
};

// パララックス染色
Game_Picture.prototype.tintParallax = function(tone, duration) {
    this.tint(tone, duration);
};

// 消去
var _Game_Picture_erase =
    Game_Picture.prototype.erase;
Game_Picture.prototype.erase = function() {
    _Game_Picture_erase.call(this);
    this.initParallax();
};

// フレーム更新
var _Game_Picture_update =
    Game_Picture.prototype.update;
Game_Picture.prototype.update = function() {
    if (this._parallax) {
        this.updateParallaxFade();
        this.updateParallaxScroll();
    }
    _Game_Picture_update.call(this);
};

// フェードの更新
Game_Picture.prototype.updateParallaxFade = function() {
    if (this._parallaxFadeSpeed !== 0) {
        if (this._opacity < this._parallaxTargetOpacity) {
            this._opacity = Math.min(
                this._opacity + this._parallaxFadeSpeed,
                this._parallaxTargetOpacity
            );
        } else {
            this._opacity = Math.max(
                this._opacity - this._parallaxFadeSpeed,
                this._parallaxTargetOpacity
            );
        }
        if (this._opacity === this._parallaxTargetOpacity) {
            this._parallaxFadeSpeed = 0;
        }
    }
};

// スクロールの更新
Game_Picture.prototype.updateParallaxScroll = function() {
    if (this._parallax) {
        if (this._parallaxIndex === 0) {
            if (this._parallaxScroll) {
                this._x += this._parallaxScrollSpeedX;
                this._y += this._parallaxScrollSpeedY;
            }
        } else {
            var basePicture = this.parallaxBasePicture();
            this._x = (
                basePicture.x() +
                basePicture.parallaxWidth() * (this._parallaxIndex % 2)
            );
            this._y = (
                basePicture.y() +
                basePicture.parallaxHeight() * Math.floor(this._parallaxIndex / 2)
            );
        }
        if (this._x < -this._parallaxWidth) {
            this._x += this._parallaxWidth;
        } else if (this._x > this._parallaxWidth) {
            this._x -= this._parallaxWidth * 2;
        }
        if (this._y < -this._parallaxHeight) {
            this._y += this._parallaxHeight;
        } else if (this._y > this._parallaxHeight) {
            this._y -= this._parallaxHeight * 2;
        }
    }
};

//-----------------------------------------------------------------------------
// Sprite_Picture
//
// ピクチャスプライト

// フレーム更新
var _Sprite_Picture_update =
    Sprite_Picture.prototype.update;
Sprite_Picture.prototype.update = function() {
    _Sprite_Picture_update.call(this);
    if (this.visible) {
        this.updatePicture();
    }
};

// ピクチャオブジェクトの更新
Sprite_Picture.prototype.updatePicture = function() {
    var picture = this.picture();
    picture.setParallaxSize(this.width, this.height);
};

})();
