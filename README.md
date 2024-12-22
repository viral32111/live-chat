# Live Chat

[![CI](https://github.com/viral32111/LiveChat/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/viral32111/LiveChat/actions/workflows/ci.yml)
[![CodeQL](https://github.com/viral32111/LiveChat/actions/workflows/codeql.yml/badge.svg)](https://github.com/viral32111/LiveChat/actions/workflows/codeql.yml)
![GitHub tag (with filter)](https://img.shields.io/github/v/tag/viral32111/LiveChat?label=Latest)
![GitHub repository size](https://img.shields.io/github/repo-size/viral32111/LiveChat?label=Size)
![GitHub release downloads](https://img.shields.io/github/downloads/viral32111/LiveChat/total?label=Downloads)
![GitHub commit activity](https://img.shields.io/github/commit-activity/m/viral32111/LiveChat?label=Commits)

This is a real-time, ephemeral, room-based chat system, housed in a dynamic & modern web application.  

![Screenshot](/Screenshot.png)

## 📥 Usage

### Deployment History

* **September 16th 2023:** Purchased new domain & deployed the project to https://live-chat.viral32111.dev.
* **September 11th 2023:** Freenom suspended my https://viral32111.cf domain.
* **July 25th 2023:** Deployed on [Oracle Cloud](https://www.oracle.com/cloud/) (including database) to https://livechat.viral32111.cf.
* **June 25th 2023:** Deployment suspended due to running out of free credit on [Google Cloud Platform](https://console.cloud.google.com/).
* **January 11th 2023:** Initially publicly deployed to https://livechat.viral32111.cf running on [Google Cloud's Compute Engine](https://cloud.google.com/compute) virtual machines, although the database is hosted on [MongoDB Atlas](https://www.mongodb.com/atlas/database).

Alternatively you can run it locally by using the official [Docker image](https://github.com/users/viral32111/packages/container/package/livechat). You will need to set all the required environment variables (see [production.env](Server/production.env)).

## 🏗️ Development

This assumes you have a MongoDB server already up and running.

* Clone this repository (`git clone https://github.com/viral32111/LiveChat.git`)
* Switch to the [server](Server/) directory (`cd ./Server`)
* Install production & development dependencies (`npm install`)
* Setup up `development.env` & `test.env` environment variables files (copy [production.env](Server/production.env) and configure appropriately).
* Run unit & integration tests (`npm test`).
* Start project (`npm start`)

## ✔️ Progress

See the [Kanban board](https://github.com/users/viral32111/projects/9), [issues](https://github.com/viral32111/LiveChat/issues?q=is%3Aissue) and [milestones](https://github.com/viral32111/LiveChat/milestones) for tracking the project's progress.

## ⚖️ License

Copyright (C) 2022 [viral32111](https://viral32111.com).

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see https://www.gnu.org/licenses.
