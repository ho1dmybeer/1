from fastapi import FastAPI\n\napp = FastAPI(title='Time Tracker API')\n\n@app.get('/health')\ndef health():\n    return {'status': 'ok'}\n
