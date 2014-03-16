---
layout: post
title: "一次元配列の各要素をキーにしたハッシュを作る、その2"
date: 2014-03-16 03:01:30
category: programming
tags: [ruby, php]
---

一次元配列の各要素をキーにしたハッシュを作る方法その2です。
その1で作成したハッシュの値は、元の配列のインデックスになっていました。
その値を任意で決めたい時は…

PHP:
{% highlight php %}
<?php
$a = range('a', 'z');
$h = array_fill_keys($a, 'value');
{% endhighlight %}

Ruby:
{% highlight ruby %}
a = 'a'..'z'
h = Hash[a.map.each {|v| [v, 'value']}]
{% endhighlight %}

Ruby で値を nil にしたい時は別パターンがある、と。
色んな書き方が出来て楽しい！

{% highlight ruby %}
a = 'a'..'z'
h = Hash[a.to_a.product]
{% endhighlight %}

