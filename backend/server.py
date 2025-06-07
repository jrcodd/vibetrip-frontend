#!/usr/bin/env python3
"""
Simple HTTP server for Expo app backend
Uses only Python standard library for WebContainer compatibility
"""

import json
import time
from datetime import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import threading

class APIHandler(BaseHTTPRequestHandler):
    """HTTP request handler for API endpoints"""
    
    def _send_cors_headers(self):
        """Send CORS headers to allow frontend access"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    
    def _send_json_response(self, data, status_code=200):
        """Send JSON response with proper headers"""
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self._send_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))
    
    def _send_error_response(self, message, status_code=400):
        """Send error response"""
        self._send_json_response({
            'error': message,
            'status': 'error'
        }, status_code)
    
    def do_OPTIONS(self):
        """Handle preflight requests"""
        self.send_response(200)
        self._send_cors_headers()
        self.end_headers()
    
    def do_GET(self):
        """Handle GET requests"""
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        query_params = parse_qs(parsed_path.query)
        
        try:
            if path == '/api/health':
                self._handle_health_check()
            elif path == '/api/users':
                self._handle_get_users()
            elif path == '/api/data':
                self._handle_get_data()
            elif path == '/api/time':
                self._handle_get_time()
            else:
                self._send_error_response('Endpoint not found', 404)
        except Exception as e:
            self._send_error_response(f'Server error: {str(e)}', 500)
    
    def do_POST(self):
        """Handle POST requests"""
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            
            if content_length > 0:
                request_data = json.loads(post_data.decode('utf-8'))
            else:
                request_data = {}
            
            if path == '/api/users':
                self._handle_create_user(request_data)
            else:
                self._send_error_response('Endpoint not found', 404)
        except json.JSONDecodeError:
            self._send_error_response('Invalid JSON data', 400)
        except Exception as e:
            self._send_error_response(f'Server error: {str(e)}', 500)
    
    def _handle_health_check(self):
        """Health check endpoint"""
        self._send_json_response({
            'status': 'healthy',
            'message': 'Python backend is running',
            'timestamp': datetime.now().isoformat()
        })
    
    def _handle_get_users(self):
        """Get users endpoint"""
        users = [
            {
                'id': 1,
                'name': 'John Doe',
                'email': 'john@example.com',
                'role': 'admin'
            },
            {
                'id': 2,
                'name': 'Jane Smith',
                'email': 'jane@example.com',
                'role': 'user'
            },
            {
                'id': 3,
                'name': 'Bob Johnson',
                'email': 'bob@example.com',
                'role': 'user'
            }
        ]
        
        self._send_json_response({
            'users': users,
            'total': len(users),
            'status': 'success'
        })
    
    def _handle_get_data(self):
        """Get sample data endpoint"""
        sample_data = {
            'message': 'Hello from Python backend!',
            'data': {
                'items': ['apple', 'banana', 'orange'],
                'count': 3,
                'categories': {
                    'fruits': 3,
                    'vegetables': 0
                }
            },
            'metadata': {
                'generated_at': datetime.now().isoformat(),
                'version': '1.0.0'
            }
        }
        
        self._send_json_response(sample_data)
    
    def _handle_get_time(self):
        """Get server time endpoint"""
        now = datetime.now()
        
        self._send_json_response({
            'timestamp': now.isoformat(),
            'unix_timestamp': int(now.timestamp()),
            'formatted': now.strftime('%Y-%m-%d %H:%M:%S'),
            'timezone': 'UTC',
            'day_of_week': now.strftime('%A')
        })
    
    def _handle_create_user(self, data):
        """Create user endpoint"""
        required_fields = ['name', 'email']
        
        for field in required_fields:
            if field not in data:
                self._send_error_response(f'Missing required field: {field}', 400)
                return
        
        # Simulate creating a user
        new_user = {
            'id': int(time.time()),  # Simple ID generation
            'name': data['name'],
            'email': data['email'],
            'role': data.get('role', 'user'),
            'created_at': datetime.now().isoformat()
        }
        
        self._send_json_response({
            'user': new_user,
            'message': 'User created successfully',
            'status': 'success'
        }, 201)
    
    def log_message(self, format, *args):
        """Override to customize logging"""
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {format % args}")

def run_server(port=8000):
    """Run the HTTP server"""
    server_address = ('', port)
    httpd = HTTPServer(server_address, APIHandler)
    
    print(f"🚀 Python backend server starting on port {port}")
    print(f"📡 Server running at http://localhost:{port}")
    print(f"🔗 API endpoints available:")
    print(f"   GET  /api/health  - Health check")
    print(f"   GET  /api/users   - Get users")
    print(f"   POST /api/users   - Create user")
    print(f"   GET  /api/data    - Get sample data")
    print(f"   GET  /api/time    - Get server time")
    print(f"📱 Connect your Expo app to test the API")
    print()
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Server shutting down...")
        httpd.server_close()

if __name__ == '__main__':
    run_server()