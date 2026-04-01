Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "C:\Users\vu241\Downloads\hospatel management system"

' Initialize git
WshShell.Run "cmd /c git init", 1, True
WScript.Echo "Git initialized"

' Add files
WshShell.Run "cmd /c git add .", 1, True
WScript.Echo "Files added"

' Commit
WshShell.Run "cmd /c git commit -m ""Initial commit: Hospital Management System"" -m ""Complete hospital management system with frontend and backend"" -m """" -m ""Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>""", 1, True
WScript.Echo "Commit created"

' Set branch to main
WshShell.Run "cmd /c git branch -M main", 1, True
WScript.Echo "Branch set to main"

' Add remote
WshShell.Run "cmd /c git remote add origin https://github.com/sanjutalari/hospital-management-system.git", 1, True
WScript.Echo "Remote added"

' Push
WshShell.Run "cmd /c git push -u origin main", 1, True
WScript.Echo "Pushed to GitHub!"

WScript.Echo "Complete! Your code is now on GitHub."
