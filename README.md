<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Testador de Usuários - Supabase</title>
    <link href="https://googleapis.com" rel="stylesheet">
    <script src="https://jsdelivr.net"></script>
    <style>
        body { font-family: 'Inter', sans-serif; background: #f4f6f8; padding: 30px; color: #1f2937; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 24px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        h2 { margin-bottom: 20px; color: #2d5d40; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
        .card { border: 1px solid #e5e7eb; padding: 16px; border-radius: 8px; background: #fafafa; }
        label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; }
        input, select, button { width: 100%; padding: 10px; margin-bottom: 12px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; font-size: 14px; }
        button { background: #2d5d40; color: white; border: none; font-weight: 600; cursor: pointer; transition: 0.2s; }
        button:hover { background: #1f422e; }
        .filter-box { margin-bottom: 20px; display: flex; gap: 10px; align-items: center; }
        .filter-box select { margin: 0; flex: 1; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
        th { background: #f1f5f9; font-weight: 600; }
        .status { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; background: #d1fae5; color: #065f46; display: inline-block; }
    </style>
</head>
<body>

<div class="container">
    <h2>🛠️ Testador de Conexão: Tabela de Usuários</h2>  
    <div class="grid">
        <!-- FORMULÁRIO PARA ADICIONAR -->
        <div class="card">
            <h3>Cadastrar Novo no Banco</h3>
            <form id="userForm" style="margin-top: 15px;">
                <label>Nome de Guerra</label>
                <input id="userName" required placeholder="Ex: Silva">
                <label>Posto / Graduação</label>
                <select id="userGrad">
                    <option>Oficial</option>
                    <option>St / Sgt</option>
                    <option>Cb</option>
                    <option selected>Sd</option>
                </select>
                <label>Seção</label>
                <select id="userSec">
                    <option>S1</option><option>S2</option><option selected>S3</option><option>S4</option>
                    <option>Fiscalização</option><option>Pagamento</option><option>SALC</option>
                    <option>Garagem</option><option>Informática</option>
                </select>
                <label>Função / Papel</label>
                <input id="userRole" required placeholder="Ex: Auxiliar">  
                <button type="submit">Inserir no Supabase</button>
            </form>
        </div>
        <!-- STATUS DA CONEXÃO -->
        <div class="card" style="display: flex; flex-direction: column; justify-content: space-between;">
            <div>
                <h3>Status do Banco</h3>
                <p style="margin-top:15px; font-size: 14px;"><strong>URL:</strong> bpvijatnsluwsgnzklrd</p>
                <p style="margin-top:5px; font-size: 14px;"><strong>Tabela Alvo:</strong> usuarios</p>
            </div>
            <div id="connectionStatus" style="padding: 15px; border-radius: 6px; background: #fee2e2; color: #991b1b; font-weight: bold; text-align: center;">
                Conectando...
            </div>
        </div>
    </div>
    <!-- LISTA E FILTRO -->
    <h3>Militares Ativos no Sistema</h3>
    <div class="filter-box" style="margin-top: 15px;">
        <label style="margin: 0; white-space: nowrap;">Filtrar Seção:</label>
        <select id="filterSection" onchange="renderUsers()">
            <option value="">Todos</option>
            <option>S1</option><option>S2</option><option>S3</option><option>S4</option>
            <option>Fiscalização</option><option>Pagamento</option><option>SALC</option>
            <option>Garagem</option><option>Informática</option>
        </select>
    </div>
    <table id="userTable">
        <thead>
            <tr>
                <th>ID</th>
                <th>Posto/Grad</th>
                <th>Nome</th>
                <th>Seção</th>
                <th>Papel/Função</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td colspan="6" style="text-align: center; color: var(--text-muted);">Buscando dados na nuvem...</td>
            </tr>
        </tbody>
    </table>
</div>
<script>
    // Suas credenciais vinculadas
    const SUPABASE_URL = "https://supabase.co";
    const SUPABASE_KEY = "sb_publishable_r7M3twr5mKmbYqP14HGpVQ_ruI0QB_p";
    const supabase = Supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    let allUsers = [];
    // Buscar usuários do Supabase
    async function fetchUsers() {
        const statusBox = document.getElementById("connectionStatus");
        try {
            const { data, error } = await supabase.from('usuarios').select('*').order('id', { ascending: true });         
            if (error) throw error;
            allUsers = data || [];
            statusBox.style.background = "#d1fae5";
            statusBox.style.color = "#065f46";
            statusBox.innerHTML = "🟢 Conexão OK (Tabela acessada!)";
            renderUsers();
        } catch (err) {
            statusBox.style.background = "#fee2e2";
            statusBox.style.color = "#991b1b";
            statusBox.innerHTML = "🔴 Erro: Certifique-se de ter rodado o código SQL no painel.";
            console.error(err);
        }
    }
    // Renderizar na tabela com filtros aplicados
    function renderUsers() {
        const tbody = document.querySelector("#userTable tbody");
        const filter = document.getElementById("filterSection").value;
        tbody.innerHTML = "";
        const filtered = allUsers.filter(u => !filter || u.secao === filter);
        if(filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #6b7280;">Nenhum usuário encontrado para esta seção.</td></tr>`;
            return;
        }
        filtered.forEach(u => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>#${u.id}</strong></td>
                <td>${u.graduacao}</td>
                <td><strong>${u.nome}</strong></td>
                <td>${u.secao}</td>
                <td>${u.papel}</td>
                <td><span class="status">Ativo</span></td>
            `;
            tbody.appendChild(tr);
        });
    }
    // Evento de Envio do Form (Salvar novo usuário na nuvem)
    document.getElementById("userForm").addEventListener("submit", async (e) => {
        e.preventDefault();      
        const newUser = {
            nome: document.getElementById("userName").value.trim(),
            graduacao: document.getElementById("userGrad").value,
            secao: document.getElementById("userSec").value,
            papel: document.getElementById("userRole").value.trim()
        };
        const { error } = await supabase.from('usuarios').insert([newUser]);     
        if(!error) {
            document.getElementById("userName").value = "";
            document.getElementById("userRole").value = "";
            fetchUsers(); // Recarrega a tabela imediatamente
        } else {
            alert("Erro ao inserir: " + error.message);
        }
    });
   // Iniciar teste ao abrir a página
    fetchUsers();
</script>
</body>
</html>
