---
layout: post
title: "JSFiddle が Emmet に対応していた"
date: 2014-03-11 23:05:49
category: 
tags: ["JavaScript", "Development"]
---

テキスト入力を効率化する [Emmet](http://emmet.io/) はご存知でしょうか。これは HTML や CSS などの編集が楽になるツールキットです。私は「補完なぞIDEでイナフ」という食わず嫌いで来ていたのでよく知りません！ですがそんな詳しく知らない人間が使っても作業が非常に捗ってしまう、それが Emmet なのです。
その Emmetが [JSFiddle](http://jsfiddle.net/) でも利用できることを最近知りました。

例えば、HTML のペインで `header>h1{hello}^p*3>lorem^footer>address>{name@example.com}` [Tab] と入力するだけで…

{% highlight html %}
<header>
    <h1>hello</h1>
</header>
<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illum odit assumenda iusto temporibus totam rerum id nam neque recusandae officiis consectetur veniam maxime quidem dolorem voluptates odio pariatur aliquam dolor.</p>
<p>Adipisci nostrum pariatur officiis voluptatibus expedita ullam inventore ex voluptatem corrupti ut voluptate vitae ipsam neque aut ducimus! Rem perferendis incidunt ea odit aspernatur earum numquam eligendi dolores quia sed.</p>
<p>Rem ipsa voluptate eius quia amet ullam commodi earum recusandae ipsam aliquid deserunt accusamus. Provident quibusdam delectus aliquam eius nesciunt ratione repellendus consequatur consectetur cupiditate libero iste sunt culpa illum.</p>
<footer>
    <address>name@example.com</address>
</footer>
{% endhighlight %}

とサイトの雛形があっという間に出来上がります。素晴らしいですね。みなさんもぜひ活用してみて下さい。え、知ってた。そうですか…

ちなみに JSFiddle のテキストエディターには [CodeMirror](http://codemirror.net/) が使用されています。CodeMirror は動作が軽快かつ安定していて気に入ってます。自作の [EC-CUBE 開発支援プラグイン](https://github.com/zenith6/eccube-devel/) でもコンソールの入力欄に採用しました。そのうち本体のカスタムページ管理や商品の説明欄でも利用できるようにしたいですね。

