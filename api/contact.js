// Recebe o POST do formulário de contato (contato.html) e envia o email
// via API do Zoho Mail, usando contato@uptech.eti.br como remetente e destino.
// Substitui o FormSubmit.co para que o email chegue com domínio próprio.

const ZOHO_ACCOUNTS_URL = 'https://accounts.zoho.com/oauth/v2/token';
const ZOHO_MAIL_API = 'https://mail.zoho.com/api';
const SENDER_ADDRESS = 'contato@uptech.eti.br';
const RECIPIENT_ADDRESS = 'contato@uptech.eti.br';
const THANK_YOU_URL = '/obrigado.html';
const CONTACT_PAGE_URL = '/contato.html';

async function getAccessToken() {
  const params = new URLSearchParams({
    refresh_token: process.env.ZOHO_REFRESH_TOKEN,
    client_id: process.env.ZOHO_CLIENT_ID,
    client_secret: process.env.ZOHO_CLIENT_SECRET,
    grant_type: 'refresh_token',
  });

  const response = await fetch(ZOHO_ACCOUNTS_URL, {
    method: 'POST',
    body: params,
  });

  const data = await response.json();
  if (!data.access_token) {
    throw new Error(`Falha ao obter access token do Zoho: ${JSON.stringify(data)}`);
  }
  return data.access_token;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildEmailContent(fields) {
  const rows = [
    ['Nome', fields.nome],
    ['Empresa', fields.empresa],
    ['Telefone / WhatsApp', fields.telefone],
    ['E-mail', fields.email],
    ['Assunto', fields.assunto],
  ]
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:8px 12px;font-weight:bold;background:#f0f4f8;border:1px solid #ddd;">${escapeHtml(label)}</td>
          <td style="padding:8px 12px;border:1px solid #ddd;">${escapeHtml(value) || '—'}</td>
        </tr>`
    )
    .join('');

  return `
    <div style="font-family:sans-serif;font-size:14px;color:#111;">
      <p style="font-size:15px;font-weight:bold;color:#00AABF;">
        Novo contato recebido pelo formulário do site (uptech.eti.br/contato.html)
      </p>
      <table style="border-collapse:collapse;margin-bottom:16px;">
        ${rows}
      </table>
      <p style="font-weight:bold;margin-bottom:4px;">Mensagem:</p>
      <p style="white-space:pre-wrap;padding:12px;background:#f0f4f8;border:1px solid #ddd;border-radius:4px;">${escapeHtml(fields.mensagem)}</p>
      <p style="margin-top:16px;color:#7A8BA8;font-size:12px;">
        Para responder diretamente ao cliente, envie para: ${escapeHtml(fields.email) || '(não informado)'}
      </p>
    </div>`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const fields = req.body || {};

  if (!fields.nome || !fields.telefone || !fields.mensagem) {
    res.status(400).send('Campos obrigatórios faltando (nome, telefone, mensagem).');
    return;
  }

  try {
    const accessToken = await getAccessToken();

    const subject = `[Formulário do Site] Novo contato — ${fields.assunto || 'Assunto não informado'}`;

    const sendResponse = await fetch(
      `${ZOHO_MAIL_API}/accounts/${process.env.ZOHO_ACCOUNT_ID}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromAddress: SENDER_ADDRESS,
          toAddress: RECIPIENT_ADDRESS,
          replyTo: fields.email || SENDER_ADDRESS,
          subject,
          content: buildEmailContent(fields),
          mailFormat: 'html',
          askReceipt: 'no',
        }),
      }
    );

    const sendData = await sendResponse.json();

    if (!sendResponse.ok || sendData?.status?.code >= 400) {
      throw new Error(`Zoho recusou o envio: ${JSON.stringify(sendData)}`);
    }

    res.writeHead(302, { Location: THANK_YOU_URL });
    res.end();
  } catch (error) {
    console.error('Erro ao enviar email do formulário de contato:', error);
    res.writeHead(302, { Location: `${CONTACT_PAGE_URL}?erro=1` });
    res.end();
  }
}
