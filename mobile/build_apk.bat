@echo off
REM Set Android SDK and Java paths
set "ANDROID_HOME=C:\Users\HP\AppData\Local\Android\Sdk"
set "ANDROID_SDK_ROOT=C:\Users\HP\AppData\Local\Android\Sdk"
set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
set "PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\cmdline-tools\latest\bin;%PATH%"

echo ========================================
echo Environment Variables Set:
echo ANDROID_HOME=%ANDROID_HOME%
echo ANDROID_SDK_ROOT=%ANDROID_SDK_ROOT%
echo JAVA_HOME=%JAVA_HOME%
echo ========================================

REM Verify SDK exists
if exist "%ANDROID_HOME%\platform-tools\adb.exe" (
    echo [OK] Android SDK found
) else (
    echo [ERROR] Android SDK not found at %ANDROID_HOME%
    exit /b 1
)

REM Verify Java exists
if exist "%JAVA_HOME%\bin\java.exe" (
    echo [OK] Java found
) else (
    echo [ERROR] Java not found at %JAVA_HOME%
    exit /b 1
)

echo ========================================
echo Building APK...
echo ========================================

flutter build apk --debug
