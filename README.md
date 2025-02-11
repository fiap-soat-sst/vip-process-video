# vip-process-video

<img alt="Node Version" src="https://img.shields.io/badge/Node_Version-20.18-green"> [![Setup and build](https://github.com/fiap-soat-sst/vip-process-video/actions/workflows/setup-build-pipeline.yml/badge.svg)](https://github.com/fiap-soat-sst/vip-process-video/actions/workflows/setup-build-pipeline.yml) ![coverage](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/evilfeeh/b08eb2c7df611955dd487f17d2a4c340/raw/coverage-vip-process-video.json)

This application is part of the Hackathon project from FIAP.
This is a microsservice backend Developed with TypeScript, Docker, DDD and clean architecture focused to deliver functionalities processing images provided from a video and serve them to the user.

## ABOUT

We're introducing a Software that aims to process images. This project gets a set of images and process them into a zip file.

For more details about this project and the whole systen, access: https://github.com/fiap-soat-sst and look for the files with the prefix: vip-

## HOW TO SETUP:

You will need set up your AWS vars following the .env-sample

Clone the project repository:

```bash
git clone https://github.com/fiap-soat-sst/vip-process-video.git
```

Access the project directory:

```bash
cd vip-process-video
```

Run the application with Docker Compose:

```bash
docker compose up
```

The process will look to the SQS queue provided and process the images received.
It's not necessary manual actions.
