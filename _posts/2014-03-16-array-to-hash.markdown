---
layout: post
title: "一次元配列の各要素をキーにしたハッシュを作る"
date: 2014-03-16 03:01:30
category: programming
tags: [ruby, php]
---

一次元配列の各要素をキーにしたハッシュを作る方法です。
ルックアップテーブルの作成時によく使用します。

PHP:
{% highlight php %}
<?php
$a = range('a', 'z');
$h = array_flip($a);
{% endhighlight %}

Ruby:
{% highlight ruby %}
a = 'a'..'z'
h = Hash[a.each.with_index.map {|k, v| [k, v] }]
{% endhighlight %}

Ruby でのやり方はすぐ忘れちゃう。

