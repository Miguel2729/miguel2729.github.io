import asyncio
import websockets
from http.server import SimpleHTTPRequestHandler, HTTPServer

# Dados compartilhados entre WebSocket e HTTP
connected_users = set()

# Servidor WebSocket (para notificações em tempo real)
async def websocket_handler(websocket, path):
    user_email = await websocket.recv()  # Recebe o email do usuário
    connected_users.add((websocket, user_email))
    print(f"Usuário conectado: {user_email}")

    try:
        async for message in websocket:
            data = eval(message)  # Converte string para dict (cuidado em produção!)
            if data["type"] == "new_email":
                recipient = data["email"]["to"]
                for (ws, email) in connected_users:
                    if email == recipient:
                        await ws.send(f"Novo email de {data['email']['from']}")
    except:
        connected_users.remove((websocket, user_email))

# Servidor HTTP (para servir o arquivo e-mail.html)
def run_http_server():
    server_address = ('0.0.0.0', 8000)
    httpd = HTTPServer(server_address, SimpleHTTPRequestHandler)
    print("Servidor HTTP rodando em http://localhost:8000")
    httpd.serve_forever()

# Inicia ambos os servidores
if __name__ == "__main__":
    import threading
    http_thread = threading.Thread(target=run_http_server)
    http_thread.start()

    asyncio.get_event_loop().run_until_complete(
        websockets.serve(websocket_handler, "0.0.0.0", 8765)
    )
    print("Servidor WebSocket rodando em ws://localhost:8765")
    asyncio.get_event_loop().run_forever()