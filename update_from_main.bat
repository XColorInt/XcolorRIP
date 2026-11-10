@echo off
rem Copies the website from the main XColorRIP project into this repository (public folder).
rem Source of truth = D:\zwork\dev\xcolorrip_github\docs\marketing\site
set SRC=D:\zwork\dev\xcolorrip_github\docs\marketing\site
set DST=%~dp0public
robocopy "%SRC%" "%DST%" /MIR /XF _headers /NFL /NDL /NJH /NJS
echo done. Now: git add -A ^&^& git commit -m "update site" ^&^& git push   (Cloudflare publishes by itself)
