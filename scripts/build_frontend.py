import os
import subprocess

def main():
    frontend_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'frontend')
    os.chdir(frontend_dir)
    subprocess.run(['bun', 'run', 'build'], check=True)

if __name__ == "__main__":
    main()