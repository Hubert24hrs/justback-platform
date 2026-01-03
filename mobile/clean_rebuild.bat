@echo off
set "ANDROID_HOME=C:\Users\HP\AppData\Local\Android\Sdk"
set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
set "PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\cmdline-tools\latest\bin;%PATH%"

echo Killing Java/Gradle processes...
taskkill /F /IM java.exe 2>nul
taskkill /F /IM gradle.exe 2>nul
taskkill /F /IM dart.exe 2>nul

echo Generating local.properties...
echo sdk.dir=C:\\Users\\HP\\AppData\\Local\\Android\\Sdk > android\local.properties
echo flutter.sdk=C:\\src\\flutter\\flutter >> android\local.properties
echo flutter.buildMode=debug >> android\local.properties
echo flutter.versionName=1.0.0 >> android\local.properties
echo flutter.versionCode=1 >> android\local.properties

echo Cleaning project...
call flutter clean

echo Getting dependencies...
call flutter pub get

echo Building APK...
call flutter build apk --debug
