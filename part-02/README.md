# Part 2 — Build and run your first Docker app

By the end of this lesson, you will build an image, run a container, inspect it, stop and restart it, and replace it with a new version of your app.

## Before you begin

- Install [Docker Desktop](https://docs.docker.com/get-docker/) and start it. On Windows, use Linux containers. An already configured Linux Docker Engine also works.
- Use a terminal and any text editor. Commands below work in PowerShell, macOS Terminal and common Linux shells.
- Open this `part-02` directory in your terminal. It contains `Dockerfile`, `app.js` and `index.html`.
- You need internet access for the first base-image download. You do **not** need to install Node.js or npm locally.

Check that both the Docker client and server are available:

```sh
docker version
```

If this prints a server connection error, start Docker Desktop and wait until its engine is running.

## 1. Read the app and its Dockerfile

`app.js` serves a single HTML page using Node's built-in HTTP module. The greeting is near the top:

```js
const message = 'Hello from Docker!';
```

The app listens on `0.0.0.0:3000` **inside the container**. This lets Docker forward requests to it. The tutorial does not install any extra packages.

```dockerfile
FROM node:24-slim
WORKDIR /app
COPY app.js index.html ./
USER node
EXPOSE 3000
CMD ["node", "app.js"]
```

| Instruction | Meaning |
| --- | --- |
| `FROM` | Start from the official Node.js 24 slim image. |
| `WORKDIR` | Use `/app` as the working directory inside the image. |
| `COPY` | Copy these two local files into that directory during the build. |
| `USER` | Run the application as the image's non-root `node` user. |
| `EXPOSE` | Document the port used by the app. This does **not** publish it to your computer. |
| `CMD` | Specify the default command to start when a container is created from this image. |

The `.dockerignore` file excludes local environment files and other unnecessary files from the build context. The explicit `COPY` also limits what this image receives. Do not put passwords or API keys in your source files or image.

## 2. Build an image

```sh
docker build -t neufology-app:1 .
```

`neufology-app` is the image name, `1` is its tag, and the final dot means “use this directory as the build context.” The first build may download the base image. Later builds can reuse cached layers.

**Predict:** the build succeeded. Is the website running yet?

No. You have built an image. Start a container to run the app.

## 3. Run the app

```sh
docker run -d --name neufology-demo -p 127.0.0.1:8080:3000 neufology-app:1
```

- `-d` runs the container in the background.
- `--name` gives this container a readable name.
- `-p 127.0.0.1:8080:3000` connects port **8080 on your computer's loopback address** to port **3000 inside the container**. This demo is available locally, rather than published to all host network interfaces.
- `neufology-app:1` selects the image used to create it.

Open [http://localhost:8080](http://localhost:8080). You should see **Hello from Docker!** If your system resolves `localhost` differently, use [http://127.0.0.1:8080](http://127.0.0.1:8080).

## 4. Inspect, stop and restart

```sh
docker ps
docker logs neufology-demo
```

`docker ps` lists running containers.

If you already have other containers, add `--filter name=neufology-demo` to `docker ps` or `docker ps -a` to focus the list on this lesson's container. The video uses this filter on its recording machine.

The log should include:

```text
Neufology app is listening on port 3000
```

**Predict:** if you stop this container, does Docker delete it?

```sh
docker stop neufology-demo
docker ps -a
```

It is stopped, not deleted. `docker ps -a` includes stopped containers. Refresh the browser: the server is no longer available. A browser can keep its previous page visible until you refresh.

Start the **same** container again:

```sh
docker start neufology-demo
```

Refresh the browser and the greeting returns. `docker run` creates a new container; `docker start` starts an existing stopped container.

## 5. Change the source — then update the container

Change the greeting in `app.js` and save the file:

```js
const message = 'I built my first Docker app!';
```

**Predict:** does refreshing the browser now show your new message?

No. `COPY` put a snapshot of your files into the image at build time. The running container still uses that packaged version. We have not connected a live source-code folder to the container.

Build a second image:

```sh
docker build -t neufology-app:2 .
```

Building a new image does not automatically update the existing container. Stop and remove this tutorial container, then create its replacement from version 2:

```sh
docker stop neufology-demo
docker rm neufology-demo
docker run -d --name neufology-demo -p 127.0.0.1:8080:3000 neufology-app:2
```

Refresh the browser. It now says **I built my first Docker app!**

Removing a container removes its writable container layer. This tiny demo does not store user data. For apps that do, plan persistent storage before replacing containers; volumes and bind mounts are a later lesson.

## Your challenge

Change the greeting to your own message, build `neufology-app:3`, and replace the tutorial container using host port **8081**. Keep the app's container port at **3000**.

<details>
<summary>Show the commands after you try it</summary>

```sh
docker build -t neufology-app:3 .
docker stop neufology-demo
docker rm neufology-demo
docker run -d --name neufology-demo -p 127.0.0.1:8081:3000 neufology-app:3
```

Open [http://localhost:8081](http://localhost:8081).

</details>

## Troubleshooting

| What happened? | What to check |
| --- | --- |
| Cannot connect to the Docker daemon | Start Docker Desktop; wait for the engine; check `docker version`. |
| Dockerfile not found | Run the build from this `part-02` folder. Keep the final dot. |
| Port 8080 is already allocated | Use `-p 127.0.0.1:8081:3000` and open port 8081 in the browser. |
| Container name is already in use | Inspect `docker ps -a`. If it is your stopped tutorial container, start it with `docker start neufology-demo`, or deliberately remove it before creating a replacement. |
| Browser cannot connect | Check `docker ps`, check the published port, and read `docker logs neufology-demo`. Try `http://127.0.0.1:8080`. |
| New greeting does not appear | Save the file, build the new tag, and replace the container using that new tag. A refresh or restart of the old container does not copy new source files into it. |

## Clean up this lesson only

When you are done with the tutorial container:

```sh
docker stop neufology-demo
docker rm neufology-demo
```

The images remain available. If you also want to remove the images you built for this lesson, remove only the tags you created:

```sh
docker image rm neufology-app:1 neufology-app:2
```

If you completed the challenge, remove `neufology-app:3` as well. These commands deliberately avoid broad pruning of unrelated Docker resources.

## What to remember

**Dockerfile → image → container.** A Dockerfile describes the build. An image is the packaged app and runtime files. A container is an instance created from that image; it may be running or stopped.

Linux containers share a Linux kernel. Docker Desktop on Windows and macOS supplies that kernel through a Linux virtual machine. An image still needs a compatible operating system, CPU architecture and runtime configuration.

## Reproducibility and sources

The repository's `part-02` Git tag preserves this lesson's source. `node:24-slim` is a maintained base-image tag and can change as updates are released. For deployments that require an identical base, pin a verified image digest and manage updates deliberately; the teaching example keeps the tag readable.

- [Official Node.js image](https://hub.docker.com/_/node)
- [Dockerfile reference](https://docs.docker.com/reference/dockerfile/)
- [Build context and .dockerignore](https://docs.docker.com/build/building/context/)
- [Port publishing](https://docs.docker.com/engine/network/port-publishing/)
- [Container concepts](https://docs.docker.com/learn/content/what-is-a-container/)
- [Docker Desktop installation](https://docs.docker.com/get-docker/)
