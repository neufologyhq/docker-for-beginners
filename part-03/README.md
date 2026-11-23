# Part 3 — Edit your app without rebuilding every time

A bind mount connects your working folder to a container. In this lesson, you will prove that the container can see a saved edit, discover why this app still needs a restart, and compare it with a second container using the original image.

The lesson reuses the small app from [Part 2](../part-02/README.md). Its page still carries the Part 2 label because it is the same example, not a different application. There are no npm dependencies and you do not need Node installed on your computer.

## Before you begin

- Start Docker Desktop. On Windows, use Linux containers. A configured local Linux Docker Engine also works.
- Open this `part-03` directory in PowerShell, macOS Terminal or a Linux shell. It must contain `app.js`, `index.html` and `Dockerfile`.
- This lesson assumes a local Docker engine. A remote daemon cannot bind-mount a folder from your local computer.
- Use ports **8082** and **8083**, and container names **neufology-dev** and **neufology-image-check**, only if they are available. Inspect any existing container with one of these names before deciding what to do with it.

```sh
docker version
docker image ls neufology-app
```

We use the original `neufology-app:1` image from Part 2, containing **Hello from Docker!** If you do not have it, build it once from this folder **before editing the greeting**:

```sh
docker build -t neufology-app:1 .
```

Do not overwrite an image tag you use for other work. If your `neufology-app:1` was already rebuilt with different code, choose a separate teaching tag and use it consistently in both run commands below. The comparison requires both containers to use the same original image.

## 1. Connect your source folder

Run the command from this `part-03` directory.

**Windows PowerShell:**

```powershell
docker run -d --name neufology-dev -p 127.0.0.1:8082:3000 --mount "type=bind,source=$($PWD.Path),target=/app,readonly" neufology-app:1
```

**macOS or Linux shell:**

```sh
docker run -d --name neufology-dev -p 127.0.0.1:8082:3000 --mount "type=bind,source=$(pwd),target=/app,readonly" neufology-app:1
```

Keep the quotes around the mount specification so paths containing spaces remain one argument. Use an ordinary project path without commas for these examples. The PowerShell expression is not Command Prompt syntax.

| Part of the command | What it means |
| --- | --- |
| `-d` | Run detached, so your terminal remains available. |
| `--name neufology-dev` | Give this new development container a readable name. |
| `-p 127.0.0.1:8082:3000` | Publish host loopback port 8082 to the app's container port 3000. |
| `type=bind` | Use a bind mount. |
| `source=...` | Use the terminal's current project folder on your computer. |
| `target=/app` | Make that folder visible at `/app` inside this container. |
| `readonly` | Prevent writes through this mount from inside the container. Host-side editing still works. |
| `neufology-app:1` | Create the container from the original image. |

Open [http://localhost:8082](http://localhost:8082). It should say **Hello from Docker!** If necessary, use [http://127.0.0.1:8082](http://127.0.0.1:8082).

## 2. Save an edit and inspect it

In `app.js`, replace the greeting line and save the file:

```js
const message = "I'm editing this without rebuilding.";
```

Double quotes let the apostrophe in `I'm` remain part of the string.

Before refreshing, read the first six source lines from inside the running container:

```sh
docker exec neufology-dev head -n 6 /app/app.js
```

The new message should already be visible. `docker exec` runs a command inside an existing running container; `head -n 6` prints just the first six lines so the greeting stays easy to see.

**Predict:** will refreshing the browser now show the new greeting?

Refresh it. This app still shows the old message. The bind mount is working, but the program prepared its page when Node started:

```js
const page = fs.readFileSync('/app/index.html', 'utf8')
  .replace('{{MESSAGE}}', message);
```

That initialization is outside the request handler. Saving a file does not change the page already held by this running process. This is not a browser-cache demonstration: the app sends `Cache-Control: no-store`.

## 3. Restart, then refresh

```sh
docker restart neufology-dev
```

Wait for the app to start, then refresh [port 8082](http://localhost:8082). The edited greeting appears. We restarted the same container; we did not build another image or create a replacement container.

For this app, the loop is:

1. **Save** — the bind mount makes the changed file available.
2. **Restart** — Node starts again and prepares the page from the changed file.
3. **Refresh** — the browser requests the newly prepared page.

Editing `index.html` also needs a restart because this app reads it once at startup. Restarting does not add or change a mount configuration; this container already has its mount.

### What about automatic restarts?

Development tools can watch files and restart the server. Node has `--watch`, but host filesystem change notifications depend on the operating system and mount setup. In our Windows-folder-to-Linux-container test, the saved edit was visible inside the container, but native Node watch mode did not restart it. Docker's WSL guidance recommends keeping source in the Linux filesystem when Linux file-change events are required.

This lesson therefore uses the explicit, tested restart command. A server restart and a browser refresh remain separate actions unless your development tooling also implements browser reload.

## 4. Prove that the image did not change

**Predict:** what will a second container from the same image show if it has no bind mount?

```sh
docker run -d --name neufology-image-check -p 127.0.0.1:8083:3000 neufology-app:1
```

Open [http://localhost:8083](http://localhost:8083).

| Page | Files used | Expected greeting |
| --- | --- | --- |
| Port 8082, `neufology-dev` | Your edited folder through the bind mount | I'm editing this without rebuilding. |
| Port 8083, `neufology-image-check` | Files packaged into the original image | Hello from Docker! |

The image still contains its original files. The edited folder exists on your computer; sharing the image alone would not share those edits.

## 5. Understand the boundaries

Mounting this folder at `/app` hides the image's existing files at that location **for this container**. It does not merge both folders or rewrite the image. Mounting an empty or incorrect folder can leave the app unable to find `app.js` or `index.html`.

`.dockerignore` filters files sent to the **build context**. It does not filter files in a folder mounted into a running container. Keep private files out of this demo directory and mount only what the app needs. `readonly` prevents writes through the mount; it does not prevent the app from reading the mounted files.

The image runs as the non-root `node` user. The host directory and files must allow that user to traverse/read them; host permissions and Docker Desktop file-sharing settings still matter. Read-only access is sufficient for this app because it does not write application data.

You still build a new image when changing its packaged runtime or dependencies, or when packaging source changes to share or deploy. A development bind mount does not update that packaged image for you.

## Your challenge

Change the greeting again, save it, restart `neufology-dev`, and refresh port 8082 without running `docker build`. Check port 8083 too. Explain why the two pages differ even though both containers came from the same image.

## Troubleshooting

| What happened? | What to check |
| --- | --- |
| Cannot connect to the Docker daemon | Start Docker Desktop and wait for the engine. Check `docker version`. |
| Container name is already in use | Inspect `docker ps -a --filter name=neufology-dev` or the corresponding control name. Do not remove an unrelated container. |
| Port is already allocated | Pick another free host port; leave container port 3000 unchanged and open the chosen host port in the browser. |
| Mount source does not exist | Check the source path. Run the command from the actual project directory. `--mount` does not silently create a missing source directory. |
| App exits or cannot find files | Check `docker logs neufology-dev`. Ensure the mounted folder contains both `app.js` and `index.html`; the mount hides the image's `/app` contents. |
| File changed but browser did not | Save, check the file with `docker exec`, wait for `docker restart neufology-dev`, then refresh the correct port. |
| Permission denied | Check host folder read/traverse permissions and Docker Desktop sharing settings. Do not solve this by giving unrelated folders broad permissions. |
| Port 8083 already shows edited words | Your image was built from edited source. Use a fresh baseline image for both containers, then make the host-side edit afterward. |
| Browser cannot connect | Check `docker ps --filter name=neufology-dev`, logs and the published port. Try `127.0.0.1` instead of `localhost`. |

## Clean up this lesson only

After you have finished with **these two practice containers**:

```sh
docker stop neufology-dev neufology-image-check
docker rm neufology-dev neufology-image-check
```

Your source folder and images remain. Removing these containers does not delete the bind-mounted host files. These commands do not prune other Docker resources.

## Sources and reproducibility

The included app files are unchanged from the Part 2 baseline. The recording used Docker Desktop with Linux containers, Docker Engine 29.8.2, and the existing lesson image containing Node 24.22.3. `node:24-slim` is a maintained tag; a fresh build may receive a newer patch release. The commands use standard Docker bind-mount behavior rather than requiring that exact patch version.

- [Docker bind mounts](https://docs.docker.com/engine/storage/bind-mounts/)
- [Docker restart](https://docs.docker.com/reference/cli/docker/container/restart/)
- [Build context and .dockerignore](https://docs.docker.com/build/concepts/context/#dockerignore-files)
- [Docker Desktop WSL best practices](https://docs.docker.com/desktop/features/wsl/best-practices/)
- [Node 24 watch mode](https://nodejs.org/download/release/v24.22.1/docs/api/cli.html#--watch)
- [Node 24 filesystem watching caveats](https://nodejs.org/download/release/v24.22.1/docs/api/fs.html#caveats)
