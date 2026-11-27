# Part 4 — Delete the container. Keep the data.

Save a note, replace its container, and find out what survives. Then repeat the experiment with a **named volume**.

These are the actual app files used in Neufology's Docker Part 4 video. The app uses Node.js's built-in HTTP and file APIs, with no npm dependencies. It saves one note in `/data/notes.json` on the server. The browser does not store the note in local storage.

## Before you begin

- Start Docker Desktop and use **Linux containers** on Windows. A local Linux Docker Engine also works.
- Open this `part-04` folder in your terminal. You should see `Dockerfile`, `app.js`, and `index.html`.
- You do not need Node.js installed on your computer; the image supplies it.
- Use an unused port **8084**, container name **neufology-notes-demo**, and volume name **neufology-notes**. If these already belong to another project, choose different names consistently. Start with a fresh practice volume for this experiment.

From an existing clone, run `git pull`, then `cd part-04`. For a new clone:

```sh
git clone https://github.com/neufologyhq/docker-for-beginners.git
cd docker-for-beginners/part-04
```

GitHub's **Code → Download ZIP** also works. Extract it and open the `part-04` folder. The single-line Docker commands below work in Windows PowerShell, macOS Terminal, and Linux shells with a local Docker engine.

## 1. Build and run without a mount

```sh
docker build -t neufology-notes:4 .
docker run -d --name neufology-notes-demo -p 127.0.0.1:8084:3000 neufology-notes:4
```

Open [http://127.0.0.1:8084](http://127.0.0.1:8084). Type **Learn Docker volumes.** and click **Save**. Refresh the page: the server should return the saved note.

| Command part | What it means |
| --- | --- |
| `docker build` | Build an image from this folder's Dockerfile. |
| `-t neufology-notes:4` | Name and tag the image. |
| `.` | Use the current directory as the build context. |
| `docker run` | Create and start a new container from an image. |
| `-d` | Detached mode: run in the background and leave the terminal available. |
| `--name neufology-notes-demo` | Give the container a readable name. |
| `-p 127.0.0.1:8084:3000` | Map this computer's loopback port 8084 to port 3000 in the container. |

The Dockerfile creates `/data` with permission for the `node` user to write there. It deliberately has no `VOLUME` instruction, so this first run has no automatic data volume.

## 2. Stop and start the same container

```sh
docker stop neufology-notes-demo
docker start neufology-notes-demo
```

Wait for the app to start, then refresh. **The note stays.** Stopping a container does not remove its writable layer.

## 3. Remove and replace the container

```sh
docker stop neufology-notes-demo
docker rm neufology-notes-demo
docker run -d --name neufology-notes-demo -p 127.0.0.1:8084:3000 neufology-notes:4
```

Refresh when the app is ready. **The first note is gone.** The new container uses the same image and name, but has a new ID and writable layer.

The image contains the application built earlier. It never contained the note you typed after building it. Without a mount at `/data`, that note belonged to the old container's writable layer, which was removed with the container.

### What does “ephemeral” mean?

**Ephemeral containers are temporary and replaceable.** Design the application so you can replace its container while keeping important data in persistent storage. Ephemeral does not mean that every stop or restart erases the files.

## 4. Attach a named volume

Create the volume, then replace the empty practice container with one that uses it:

```sh
docker volume create neufology-notes
docker stop neufology-notes-demo
docker rm neufology-notes-demo
docker run -d --name neufology-notes-demo -p 127.0.0.1:8084:3000 --mount type=volume,source=neufology-notes,target=/data neufology-notes:4
```

| Mount option | What it means |
| --- | --- |
| `--mount` | Connect storage to the container. |
| `type=volume` | Use a Docker-managed volume. |
| `source=neufology-notes` | Use the named volume `neufology-notes`. |
| `target=/data` | Make that volume available at `/data` inside the container. |

The target matches where this app writes its file. The mount is writable by default; this app needs write access. Creating a volume alone does not connect it to an existing container.

## 5. Save and verify a new note

Refresh, then save **This note should stay.**

```sh
docker exec neufology-notes-demo cat /data/notes.json
docker inspect --format '{{json .Mounts}}' neufology-notes-demo
```

The first command runs `cat` inside the running container and prints its server-side file. The second prints its mounts. Look for:

- `Type`: `volume`
- `Name`: `neufology-notes`
- `Destination`: `/data`
- `RW`: `true`

This is a **new note**. Attaching the volume does not recover the first note lost in Step 3.

## 6. Replace the container and reuse the volume

```sh
docker stop neufology-notes-demo
docker rm neufology-notes-demo
docker volume ls --filter name=neufology-notes
docker run -d --name neufology-notes-demo -p 127.0.0.1:8084:3000 --mount type=volume,source=neufology-notes,target=/data neufology-notes:4
```

Refresh when the app is ready. **The new note stays.** The replacement container is reading the same volume.

`--filter name=neufology-notes` narrows the displayed volume list to matching names. It does not delete or modify other volumes.

| Action | Where the note lives | Expected result |
| --- | --- | --- |
| Stop and start the same unmounted container | Its writable layer | Note stays. |
| Remove it and create a replacement | Old writable layer | Old note is gone. |
| Remove a mounted container and reuse its named volume | Named volume | Saved volume note stays. |

## 7. Volumes versus bind mounts

In [Part 3](../part-03/README.md), a bind mount connected your source-code folder to the container. Here, a named volume provides storage managed by Docker.

| Bind mount | Named volume |
| --- | --- |
| You choose a host file or directory path. | You choose a volume name. |
| Useful for editing local source files during development. | Useful for app data that must outlive a container. |
| Host path and permissions matter. | Correct volume name, target path, and permissions matter. |

Both can persist data outside the container's writable layer. A volume is not automatically a backup, and its data is not automatically included when you share an image. This lesson uses a local volume; deleting that volume or losing its underlying storage can lose the notes. Back up important data separately.

Inspect the volume with:

```sh
docker volume inspect neufology-notes
```

In Docker Desktop, you can also find it under **Volumes**. With Linux containers on Docker Desktop, the volume's Linux mountpoint is inside Docker's environment, not an ordinary Windows project folder.

## 8. Try the challenge

Save a note of your own. Then give the replacement container a **different name**, while attaching the **same volume at `/data`**:

```sh
docker stop neufology-notes-demo
docker rm neufology-notes-demo
docker run -d --name neufology-notes-challenge -p 127.0.0.1:8084:3000 --mount type=volume,source=neufology-notes,target=/data neufology-notes:4
```

Refresh. Does your note stay? Explain why reusing a container name did not preserve the first note, while reusing the volume preserved the second.

## 9. Finish the exercise

If you completed the challenge:

```sh
docker stop neufology-notes-challenge
docker rm neufology-notes-challenge
```

If you stopped before the challenge, use `neufology-notes-demo` instead. Stop and remove only the practice container you created. **Keep the volume if you want its notes.** You do not need broad cleanup or prune commands to finish this lesson.

## If something looks different

| Symptom | What to check |
| --- | --- |
| Container name already in use | Check the existing container before deciding what to do with it, or choose another practice name. |
| Port 8084 is occupied | Choose another unused host port, such as `127.0.0.1:8085:3000`, and update the browser URL. |
| Page is temporarily unavailable | Wait for the container to start. Check `docker logs neufology-notes-demo` using your current container name. |
| No saved note after adding the volume | Save a new note after attaching it. The earlier lost note is not recovered. |
| Note disappears after replacement | Check the volume name and confirm `Destination` is `/data`. |
| An old note appears immediately | You reused an existing volume. Choose a fresh practice volume name for the experiment. |

This is a small, single-user teaching app. Keep it on localhost for this exercise. The `node:24-slim` base-image tag can receive updates; container IDs and build output may differ from the recording.

## Official references

- [Volumes and their lifecycle](https://docs.docker.com/engine/storage/volumes/)
- [Container writable layers and storage](https://docs.docker.com/engine/storage/)
- [Create ephemeral containers](https://docs.docker.com/build/building/best-practices/#create-ephemeral-containers)
- [Bind mounts](https://docs.docker.com/engine/storage/bind-mounts/)
- [Volumes in Docker Desktop](https://docs.docker.com/desktop/use-desktop/volumes/)

[Back to the series](../README.md)
