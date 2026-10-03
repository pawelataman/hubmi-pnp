"""Run the local frontend and backend, shutting both down together."""

import os
import shutil
import signal
import sys
import time
from contextlib import suppress
from pathlib import Path
from subprocess import Popen, TimeoutExpired
from types import FrameType


def interrupt(_signal_number: int, _frame: FrameType | None) -> None:
    """Use the same cleanup path for terminal and process-manager shutdown."""
    raise KeyboardInterrupt


def stop_services(processes: list[Popen[bytes]]) -> None:
    """Terminate each service's process group, including reload workers."""
    for process in processes:
        try:
            os.killpg(process.pid, signal.SIGTERM)
        except ProcessLookupError:
            continue

    for process in processes:
        try:
            process.wait(timeout=5)
        except TimeoutExpired:
            with suppress(ProcessLookupError):
                os.killpg(process.pid, signal.SIGKILL)
            process.wait()


def main() -> int:
    """Start both servers and stop the stack if either service exits."""
    project_root: Path = Path(__file__).resolve().parent.parent
    frontend_directory: Path = project_root / "frontend"
    vite_entrypoint: Path = frontend_directory / "node_modules/vite/bin/vite.js"
    node_executable: str | None = shutil.which("node")

    if node_executable is None or not vite_entrypoint.is_file():
        print("Install Node.js 24 and run 'make install' first.", file=sys.stderr)
        return 1

    signal.signal(signal.SIGTERM, interrupt)
    processes: list[Popen[bytes]] = []
    services: tuple[tuple[str, Path, list[str]], ...] = (
        (
            "backend",
            project_root / "backend",
            [
                sys.executable,
                "-m",
                "uvicorn",
                "app.main:app",
                "--host",
                "127.0.0.1",
                "--port",
                "8000",
                "--reload",
                "--reload-dir",
                "app",
            ],
        ),
        ("frontend", frontend_directory, [node_executable, str(vite_entrypoint)]),
    )

    try:
        for _name, directory, command in services:
            process: Popen[bytes] = Popen(
                command, cwd=directory, start_new_session=True
            )
            processes.append(process)

        print("\nFrontend: http://localhost:5173", flush=True)
        print("API docs: http://localhost:8000/docs", flush=True)
        print("Press Ctrl+C to stop both services.\n", flush=True)

        while True:
            for (name, _directory, _command), process in zip(
                services, processes, strict=True
            ):
                return_code: int | None = process.poll()
                if return_code is not None:
                    print(f"{name} exited with status {return_code}.", file=sys.stderr)
                    return return_code if return_code > 0 else 1
            time.sleep(0.2)
    except KeyboardInterrupt:
        return 0
    except OSError as error:
        print(f"Could not start the local servers: {error}", file=sys.stderr)
        return 1
    finally:
        signal.signal(signal.SIGTERM, signal.SIG_IGN)
        signal.signal(signal.SIGINT, signal.SIG_IGN)
        stop_services(processes)


if __name__ == "__main__":
    sys.exit(main())
