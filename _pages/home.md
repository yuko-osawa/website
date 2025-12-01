---
layout: home
title: Home
permalink: /
subtitle:

announcements:
  enabled: true # includes a list of news items
  scrollable: true # adds a vertical scroll bar if there are more than 3 news items
  limit: 3 # leave blank to include all the news in the `_news` folder

social: true

latest_posts:
  enabled: true
  scrollable: true # adds a vertical scroll bar if there are more than 3 new posts items
  limit: 3 # leave blank to include all the blog posts
---

{% assign personal_posts = site.static | where: 'static_content', 'biography' %}

<p>
{{ personal_posts[0].content }}
</p>
