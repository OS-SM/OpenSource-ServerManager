@ECHO OFF
set NAME=OS-SM
set VERSION=1.0.0
set BUILD_BATH=Build

SETLOCAL EnableDelayedExpansion
for /F "tokens=1,2 delims=#" %%a in ('"prompt #$H#$E# & echo on & for %%b in (1) do rem"') do (
  set "DEL=%%a"
)

call :ColorText 0C "Building %NAME% v%VERSION%"
echo.
call :ColorText 0C "---------------------"
echo.
echo.

call :ColorText 0a "Change Directory"
echo.
CD ../
echo %CD%

call :ColorText 0a "Create Build-Directory"
@IF NOT EXIST "%BUILD_BATH%" (
	call :ColorText 0a " [CREATED]"
	MD "%BUILD_BATH%"
) ELSE (
	call :ColorText 0C " [EXISTS]"
)
echo.

call :ColorText 0a "Creating Package..."
%CD%\Bin\7z\7z.exe a -r -tzip %CD%\Build\OS-SM.nw %CD%\Source\*
echo.

call :ColorText 0a "Creating Executable..."
echo.
copy /b /y %CD%\Bin\nw\nw.exe %CD%\Build\%NAME%.exe 
%CD%\Bin\ar\Resourcer.exe -op:upd -src:%CD%\Build\%NAME%.exe -type:14 -name:IDR_MAINFRAME -file:%CD%\Source\icon.ico
copy /b /y %CD%\Build\%NAME%.exe + %CD%\BUILD\%NAME%.nw %CD%\Build\%NAME%.exe

echo.
call :ColorText 0a "Copying Files..."
echo.
if not exist %CD%\Build\ffmpeg.dll copy %CD%\Bin\nw\ffmpeg.dll %CD%\Build\ffmpeg.dll
if not exist %CD%\Build\icudt.dll copy %CD%\Bin\nw\icudt.dll %CD%\Build\icudt.dll
if not exist %CD%\Build\icudtl.dat copy %CD%\Bin\nw\icudtl.dat %CD%\Build\icudtl.dat
if not exist %CD%\Build\natives_blob.bin copy %CD%\Bin\nw\natives_blob.bin %CD%\Build\natives_blob.bin
if not exist %CD%\Build\node.dll copy %CD%\Bin\nw\node.dll %CD%\Build\node.dll
if not exist %CD%\Build\nw.dll copy %CD%\Bin\nw\nw.dll %CD%\Build\nw.dll
if not exist %CD%\Build\nw_200_percent.pak copy %CD%\Bin\nw\nw_200_percent.pak %CD%\Build\nw_200_percent.pak
if not exist %CD%\Build\nw_elf.dll copy %CD%\Bin\nw\nw_elf.dll %CD%\Build\nw_elf.dll
if not exist %CD%\Build\resources.dll copy %CD%\Bin\nw\resources.pak %CD%\Build\resources.pak
if not exist %CD%\Build\nw_100_percent.pak copy %CD%\Bin\nw\nw_100_percent.pak %CD%\Build\nw_100_percent.pak
if not exist %CD%\Build\nw.pak copy %CD%\Bin\nw\nw.linux-x64\nw.pak %CD%\Build\nw.pak

echo.
call :ColorText 0a "Create Plugins-Directory..."
echo.
if not exist %CD%\Build\Plugins mkdir %CD%\Build\Plugins

echo.
call :ColorText 0a "Move Locales (Language-Files)..."
echo.
@RD /S /Q %CD%\Build\locales
xcopy /e /v %CD%\Bin\nw\locales %CD%\Build\locales\

echo.
call :ColorText 0a "Starting Application"
start /b "" "%CD%\Build\%NAME%.exe" --remote-debugging-port=2207
echo.

goto :eof
:ColorText
echo off
<nul set /p ".=%DEL%" > "%~2"
findstr /v /a:%1 /R "^$" "%~2" nul
del "%~2" > nul 2>&1
goto :eof