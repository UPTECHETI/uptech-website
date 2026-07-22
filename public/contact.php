<?php
/**
 * Recebe o POST do formulário de contato (contato.html) e envia o email
 * via API do Zoho Mail, usando contato@uptech.eti.br como remetente e destino.
 * Substitui o FormSubmit.co para que o email chegue com domínio próprio.
 *
 * IMPORTANTE: as credenciais do Zoho ficam em zoho-config.php, que NÃO
 * está no repositório Git (este repo é público). Esse arquivo precisa
 * ser enviado manualmente pelo Gerenciador de Arquivos da Hostinger,
 * na mesma pasta deste contact.php (public_html/).
 */

$configPath = __DIR__ . '/zoho-config.php';
if (!file_exists($configPath)) {
    http_response_code(500);
    error_log('contact.php: zoho-config.php não encontrado — configuração pendente.');
    header('Location: /contato.html?erro=1');
    exit;
}
require $configPath;

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo 'Method Not Allowed';
    exit;
}

$fields = [
    'nome'     => trim($_POST['nome'] ?? ''),
    'empresa'  => trim($_POST['empresa'] ?? ''),
    'telefone' => trim($_POST['telefone'] ?? ''),
    'email'    => trim($_POST['email'] ?? ''),
    'assunto'  => trim($_POST['assunto'] ?? ''),
    'mensagem' => trim($_POST['mensagem'] ?? ''),
];

if ($fields['nome'] === '' || $fields['telefone'] === '' || $fields['mensagem'] === '') {
    http_response_code(400);
    echo 'Campos obrigatórios faltando (nome, telefone, mensagem).';
    exit;
}

function zoho_get_access_token(): ?string
{
    $ch = curl_init('https://accounts.zoho.com/oauth/v2/token');
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => http_build_query([
            'refresh_token' => ZOHO_REFRESH_TOKEN,
            'client_id'     => ZOHO_CLIENT_ID,
            'client_secret' => ZOHO_CLIENT_SECRET,
            'grant_type'    => 'refresh_token',
        ]),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 15,
    ]);
    $response = curl_exec($ch);
    curl_close($ch);
    if ($response === false) {
        return null;
    }
    $data = json_decode($response, true);
    return $data['access_token'] ?? null;
}

function e(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
}

function build_email_html(array $f): string
{
    $rows = [
        ['Nome', $f['nome']],
        ['Empresa', $f['empresa']],
        ['Telefone / WhatsApp', $f['telefone']],
        ['E-mail', $f['email']],
        ['Assunto', $f['assunto']],
    ];

    $rowsHtml = '';
    foreach ($rows as [$label, $value]) {
        $displayValue = $value !== '' ? e($value) : '—';
        $rowsHtml .= '<tr>'
            . '<td style="padding:8px 12px;font-weight:bold;background:#f0f4f8;border:1px solid #ddd;">' . e($label) . '</td>'
            . '<td style="padding:8px 12px;border:1px solid #ddd;">' . $displayValue . '</td>'
            . '</tr>';
    }

    $mensagem = nl2br(e($f['mensagem']));
    $emailContato = $f['email'] !== '' ? e($f['email']) : '(não informado)';

    return '
    <div style="font-family:sans-serif;font-size:14px;color:#111;">
      <p style="font-size:15px;font-weight:bold;color:#00AABF;">Novo contato recebido pelo formulário do site (uptech.eti.br/contato.html)</p>
      <table style="border-collapse:collapse;margin-bottom:16px;">' . $rowsHtml . '</table>
      <p style="font-weight:bold;margin-bottom:4px;">Mensagem:</p>
      <p style="white-space:pre-wrap;padding:12px;background:#f0f4f8;border:1px solid #ddd;border-radius:4px;">' . $mensagem . '</p>
      <p style="margin-top:16px;color:#7A8BA8;font-size:12px;">Para responder diretamente ao cliente, envie para: ' . $emailContato . '</p>
    </div>';
}

$accessToken = zoho_get_access_token();
if (!$accessToken) {
    error_log('contact.php: falha ao obter access token do Zoho');
    header('Location: /contato.html?erro=1');
    exit;
}

$subject = '[Formulário do Site] Novo contato — ' . ($fields['assunto'] !== '' ? $fields['assunto'] : 'Assunto não informado');

// Nota: a API do Zoho Mail exige que o endereço de "replyTo" já esteja
// verificado na conta — não aceita um email arbitrário de visitante
// (confirmado em teste real: "You need to verify the ReplyTo address").
// Por isso o email do cliente NÃO vai no replyTo, só destacado no corpo
// (ver build_email_html) pra o Jaison copiar/colar na hora de responder.
$payload = [
    'fromAddress' => ZOHO_SENDER_ADDRESS,
    'toAddress'   => ZOHO_RECIPIENT_ADDRESS,
    'subject'     => $subject,
    'content'     => build_email_html($fields),
    'mailFormat'  => 'html',
    'askReceipt'  => 'no',
];

$ch = curl_init('https://mail.zoho.com/api/accounts/' . ZOHO_ACCOUNT_ID . '/messages');
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [
        'Authorization: Zoho-oauthtoken ' . $accessToken,
        'Content-Type: application/json',
    ],
    CURLOPT_POSTFIELDS => json_encode($payload),
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 15,
]);
$sendResponse = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$sendData = json_decode($sendResponse ?: '', true);
$statusCode = $sendData['status']['code'] ?? null;

if ($httpCode >= 400 || ($statusCode !== null && $statusCode >= 400)) {
    error_log('contact.php: Zoho recusou o envio: ' . $sendResponse);
    header('Location: /contato.html?erro=1');
    exit;
}

header('Location: /obrigado.html');
exit;
