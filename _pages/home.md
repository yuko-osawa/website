---
layout: home
title: Home
permalink: /
subtitle:

announcements:
  enabled: true # includes a list of news items
  limit: 2 # leave blank to include all the news in the `_news` folder
---

{% assign personal_posts = site.static | where: 'static_content', 'biography' %}

<p>
{{ personal_posts[0].content }}
</p>
