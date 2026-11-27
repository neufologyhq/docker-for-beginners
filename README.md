# Docker for Beginners — Neufology

Build it. Run it. Understand what changed.

This is the companion repository for Neufology's beginner Docker series. Each lesson keeps its example small enough to understand, and includes the commands used in the video.

## Lessons

| Part | Lesson | Files |
| --- | --- | --- |
| 1 | What is Docker? A beginner-friendly explanation | [Watch Part 1](https://www.youtube.com/watch?v=74zrKOLDrAo) |
| 2 | Build and run your first Docker app | [Lesson files](part-02/README.md) · [Watch Part 2](https://youtu.be/cQ9y_ni2-F8) |
| 3 | Edit your app without rebuilding every time | [Bind-mount lesson](part-03/README.md) |
| 4 | Delete the container. Keep the data. | [Named-volume lesson and notes app](part-04/README.md) |

Parts 2–4 use Node.js's built-in HTTP server. You do not need Node.js installed on your computer: the Docker image supplies it. There are no npm dependencies. Part 4 adds a small server-side notes app to demonstrate persistent storage.

## Get the example

```sh
git clone https://github.com/neufologyhq/docker-for-beginners.git
cd docker-for-beginners/part-02
```

You can also download the repository ZIP using GitHub's **Code → Download ZIP** button, extract it, and open `part-02` in your terminal.

For Part 3, open `part-03` and follow its README. It starts from a separate copy of the original app, so your Part 2 edits can stay where they are.

For Part 4, open `part-04` and follow its README. It includes the notes app, the exact Docker commands, flag explanations, and a challenge showing why a named volume can outlive a container.

The `part-02` Git tag preserves the files used for this lesson. Container base-image tags can receive updates independently; see the lesson's reproducibility note.

## Links

- [Neufology](https://neufology.in/)
- [Docker installation](https://docs.docker.com/get-docker/)
- [Docker learning paths](https://docs.docker.com/learn/)

Code is available under the [MIT license](LICENSE).
