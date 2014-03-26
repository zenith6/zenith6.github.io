---
layout: post
title: "透明な背景を持つ EPS ファイルを PNG へ変換する"
date: 2014-03-26 10:57:39
category: graphics
tags: [ghostscript, imagemagick, eps, png, cmyk, rgb]
---

問題
----
コマンドラインによる操作で透明な背景を持つ EPS ファイルを PNG へ変換するには？

答え
----
[Ghostscript](http://ghostscript.com/) が利用できます。

``` bash
$ gs -v
GPL Ghostscript 9.10 (2013-08-30)
Copyright (C) 2013 Artifex Software, Inc.  All rights reserved.

$ gs -sDEVICE=pngalpha -dEPSCrop -o output.png input.eps
```

引数及びオプションの意味は次の通りです。

| 引数及びオプション | 値 |
| --- | --- |
| -sDEVICE=pngalpha | 出力用デバイスに透過色を扱える pngalpha を設定。 |
| -dEPSCrop | 余白をポイポイするっぽい。 |
| -o output.png | 出力先ファイル。 |
| input.eps         | 入力元ファイル。 |


詳細は[ドキュメント](http://ghostscript.com/doc/current/Use.htm#Options)にまとめられています。
解像度など必要に応じて指定すると良いでしょう。

注意点
------

EPS ファイルのカラーモードが CMYK の場合、期待通りの結果にならない事があります。
これは EPS ファイルにカラープロファイルが埋め込まれていなかったり読み取れなかったりした場合に、
Ghostscript が持つデフォルトのプロファイルが使用されてしまうためです。
正しいプロファイルを使用するように指定する事で解決します。
指定方法は次のドキュメントに記述があります。

* http://ghostscript.com/doc/current/Use.htm#ICC_color_parameters
* http://ghostscript.com/doc/current/GS9_Color_Management.pdf

実のところ深くは理解していません；；
デザイナーさんって大変ね。

備考
----

* ImageMagick は ESP ファイルの処理を Ghostscript に処理を任せている。
    1. ggrks すると「Ghostscript の `-sDEVICE=pngalpha` オプションを使ってみよう」と言う Q&A を発見。
    1. なぜ Ghostscript が出てくるのかしら？
    1. ImageMagick 内の *delegates.xml* に Ghostscript を呼び出すコマンドがある。
    1. Q&A では *delegates.xml* を書き換えてもいいとありましたが色変換の問題が怖い。
* 透明色が必要なファイルに印刷のために作られたフォーマットを使う事に問題があるような。[PSD で下さい。](http://www.ec-cube.net/download/banner.php)
