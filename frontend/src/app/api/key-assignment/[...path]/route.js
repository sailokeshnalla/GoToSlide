import { NextResponse } from 'next/server';

const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:8000';

async function proxyRequest(req, { params }, method) {
    try {
        const pathParams = await params;
        const subpath = pathParams.path.join('/');
        const { searchParams } = new URL(req.url);
        const queryString = searchParams.toString();

        const url = `${backendUrl}/api/key-assignment/${subpath}${queryString ? '?' + queryString : ''}`;

        const headers = {
            'Content-Type': 'application/json',
        };

        const authHeader = req.headers.get('authorization');
        if (authHeader) {
            headers['Authorization'] = authHeader;
        }

        const options = {
            method,
            headers,
        };

        if (method !== 'GET' && method !== 'HEAD') {
            const bodyText = await req.text();
            if (bodyText) {
                options.body = bodyText;
            }
        }

        const response = await fetch(url, options);

        let result;
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
            result = await response.json();
        } else {
            result = { text: await response.text() };
        }

        return NextResponse.json(result, { status: response.status });
    } catch (error) {
        console.error(`Proxy error in key-assignment ${method}:`, error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function GET(req, context) {
    return proxyRequest(req, context, 'GET');
}

export async function POST(req, context) {
    return proxyRequest(req, context, 'POST');
}

export async function DELETE(req, context) {
    return proxyRequest(req, context, 'DELETE');
}