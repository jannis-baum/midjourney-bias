#!/usr/bin/osascript

on run argv
    # copy image to clipboard
    set the clipboard to (read (POSIX file (item 1 of argv)) as JPEG picture)
    # go to discord and execute /describe
    tell application "Discord" to activate
    tell application "System Events"
        keystroke "/d"
        delay 0.3
        key code 48 # tab
        key code 9 using {command down} # paste
    end tell
end run
