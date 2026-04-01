import subprocess
import os
import time
import sys

def run_command(command, cwd):
    """Starts a process in a new terminal window on Windows."""
    if sys.platform == 'win32':
        # 'start' command opens a new command prompt window
        return subprocess.Popen(f'start cmd /k "{command}"', cwd=cwd, shell=True)
    else:
        # For macOS/Linux (simplified)
        return subprocess.Popen(command.split(), cwd=cwd)

def main():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(root_dir, 'backend')
    frontend_dir = os.path.join(root_dir, 'frontend')

    print("🚀 HMS — Automated Server Launcher")
    print("-" * 40)

    # 1. Start Backend
    print("📋 Starting Backend (Port 3001)...")
    run_command("npm run dev", backend_dir)
    time.sleep(2) # Give it a moment

    # 2. Start Frontend
    print("💻 Starting Frontend (Port 5173)...")
    run_command("npm run dev", frontend_dir)
    
    print("\n✅ All servers are launching in new windows!")
    print("-" * 40)
    print("📝 STEPS TO VIEW USER DATA:")
    print("1. Open your browser and go to: http://localhost:5173")
    print("2. Login with Admin credentials (e.g. doctor@hms.com / doctor123)")
    print("3. Navigate to the 'Admin Dashboard' or 'System Overview' section.")
    print("4. There you can see all users, statistics, and system health.")
    print("\n💡 ALTERNATIVE (Database View):")
    print("If you want to see the RAW database data directly:")
    print("1. Open a new terminal in the 'backend' folder.")
    print("2. Run the command: npx prisma studio")
    print("3. This will open a browser window at http://localhost:5555 where you can edit everything.")
    print("-" * 40)

if __name__ == "__main__":
    main()
