@echo off
:begin
echo ---------------------------------------
echo Fetching SynthTnT website
curl -s -I -L https://synthtnt.onrender.com | findstr /R "^Location: ^HTTP/ ^Date:"
echo.
echo Fetching DTTEC API
curl -s -I -L https://dttec-api.onrender.com | findstr /R "^Location: ^HTTP/ ^Date:"
echo ---------------------------------------
echo.
timeout /t 600 /nobreak >nul
goto begin