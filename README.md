# Docker for Beginners — Neufology

Build it. Run it. Understand what changed.

This is the companion repository for Neufology's beginner Docker series. Each lesson keeps its example small enough to understand, and includes the commands used in the video.

## Lessons

| Part | Lesson | Files |
| --- | --- | --- |
| 1 | What is Docker? A beginner-friendly explanation | [Watch Part 1](https://www.youtube.com/watch?v=74zrKOLDrAo) |
| 2 | Build and run your first Docker app | [Start the hands-on lesson](part-02/README.md) |

Part 2 uses Node.js's built-in HTTP server. You do not need Node.js installed on your computer: the Docker image supplies it. There are no npm dependencies.

## Get the example

```sh
git clone https://github.com/neufologyhq/docker-for-beginners.git
cd docker-for-beginners/part-02
```

You can also download the repository ZIP using GitHub's **Code → Download ZIP** button, extract it, and open `part-02` in your terminal.

The `part-02` Git tag preserves the files used for this lesson. Container base-image tags can receive updates independently; see the lesson's reproducibility note.

## Links

- [Neufology](https://neufology.in/)
- [Docker installation](https://docs.docker.com/get-docker/)
- [Docker learning paths](https://docs.docker.com/learn/)

Code is available under the [MIT license](LICENSE).
