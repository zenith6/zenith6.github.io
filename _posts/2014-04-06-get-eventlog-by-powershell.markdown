---
layout: post
title: "PowerShell でイベントログを見る"
date: 2014-04-06 22:28:18
category: tool
tags: [powershell, windows]
---

PowerShell でイベントログを確認するには `Get-EventLog` を利用すればよいと知りました。

例えば
======
過去30日に発生した MySQL の警告を取得する時は:

``` powershell
PS C:\Users\zenith> Get-EventLog Application -Source MySQL -EntryType Warning -After (Get-Date).AddDays(-30)

   Index Time          EntryType   Source                 InstanceID Message
   ----- ----          ---------   ------                 ---------- -------
   43366 4 02 20:48    Warning     MySQL                  3221225572 option 'innodb-autoextend-increment': unsigned ...
   43364 4 02 20:48    Warning     MySQL                  3221225572 You have forced lower_case_table_names to 0 thr...
   43363 4 02 20:48    Warning     MySQL                  3221225572 TIMESTAMP with implicit DEFAULT value is deprec...
   43084 3 28 18:31    Warning     MySQL                  3221225572 option 'innodb-autoextend-increment': unsigned ...
   43082 3 28 18:31    Warning     MySQL                  3221225572 You have forced lower_case_table_names to 0 thr...
   43081 3 28 18:31    Warning     MySQL                  3221225572 TIMESTAMP with implicit DEFAULT value is deprec...
   42877 3 27 08:13    Warning     MySQL                  3221225572 option 'innodb-autoextend-increment': unsigned ...
   42875 3 27 08:13    Warning     MySQL                  3221225572 You have forced lower_case_table_names to 0 thr...
   42874 3 27 08:13    Warning     MySQL                  3221225572 TIMESTAMP with implicit DEFAULT value is deprec...
   42827 3 27 08:13    Warning     MySQL                  3221225572 C:\Program Files\MySQL\MySQL Server 5.6\bin\mys...
   42826 3 27 08:13    Warning     MySQL                  3221225572 C:\Program Files\MySQL\MySQL Server 5.6\bin\mys...
   42647 3 24 12:55    Warning     MySQL                  3221225572 option 'innodb-autoextend-increment': unsigned ...
   42645 3 24 12:55    Warning     MySQL                  3221225572 You have forced lower_case_table_names to 0 thr...
```

ずらら。詳細を知りたい時は `Format-List` を通すと見やすくなります。

``` powershell
PS C:\Users\zenith> Get-EventLog Application -Index 43366 | fl

Index              : 43366
EntryType          : Warning
InstanceId         : 3221225572
Message            : option 'innodb-autoextend-increment': unsigned value 67108864 adjusted to 1000

                     For more information, see Help and Support Center at http://www.mysql.com.


Category           : (0)
CategoryNumber     : 0
ReplacementStrings : {option 'innodb-autoextend-increment': unsigned value 67108864 adjusted to 1000

                     }
Source             : MySQL
TimeGenerated      : 2014/04/02 20:48:55
TimeWritten        : 2014/04/02 20:48:55
UserName           :
```

どうでもいいですが innodb-autoextend-increment の警告、インストール時からずっと出てます。
デフォルトの my.ini でも出るし、自分で指定し直しても変わりません。
MySQL さんは自分で正して置いたからな！と言うのでお言葉に甘えて何もしない事にしました。


おまけ
======
オプションだけで指定できない複雑な条件は `Where-Object` を使えという事です。
Get-EventLog が返すオブジェクトは [System.Diagnostics.EventLogEntry](http://msdn.microsoft.com/ja-jp/library/system.diagnostics.eventlogentry.aspx) です。
これを参考にしてプロパティを見るとよい、と。

参考
====
* http://technet.microsoft.com/ja-jp/library/ee176846.aspx
* http://qiita.com/myokoym@github/items/cd3242b8a791b030b327
