---
layout: post
title: "JavaScript で浮動小数点を扱うテストを書いて失敗した"
date: 2014-04-08 23:42:31
category:
tags: []
---

[QUnit](https://qunitjs.com/) を使ってテストを書いていて、浮動小数点で失敗しました。

``` javascript
function a(v) { return v + 0.1; }

test('失敗する', function () {
    var expected = 0.3;
    var actual = a(0.2);
    equal(expected, actual);
});
```

IEEE 754 の誤差を考慮していません。もう何度目の同じミスだろ；；
浮動小数点同士を比較する時はイプシロンを使うのが定石ですね。
https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Number/EPSILON より:

``` javascript
x = 0.2;
y = 0.3;
equal = (Math.abs(x - y) < Math.EPSILON)
```

でもこれをそのままテストに使うと当然合っているかどうかだけしか分かりません。

``` javascript
test('イプシロンで比較', function () {
    var epsilon = Number.EPSILON || 2.2204460492503130808472633361816E-16;
    var expected = 0.3;
    var actual = a(0.2);
    ok(Math.abs(expected - actual) < epsilon); // boolean が欲しいのではない
});
```

できれば何がどう違うのかも知りたいですよね。
悩んだ結果、期待値を式で持てばいいという結論に至りました。最適化されて定数に置き換えられたらどうしよう。
ほんとにこれでいいのかなって感じです。

``` javascript
test('期待値を定数にする必要なんてなかった', function () {
    var expected = 0.2 + 0.1;
    var actual = a(0.2);
    equal(expected, actual);
});
```

## テストに使ったソース

<iframe width="100%" height="600" src="http://jsfiddle.net/zenith6/W5mjW/embedded/result,js/" allowfullscreen="allowfullscreen" frameborder="0"></iframe>
