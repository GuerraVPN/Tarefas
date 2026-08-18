<!DOCTYPE html>
<html lang="pt-BR">
<head>
   <meta charset="UTF-8">
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   <title>Quadro de Tarefas 26º Pel PE Mec - V6 Supabase</title>
   <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
   <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
   
   <!-- Biblioteca Oficial do Supabase -->
   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

   <style>
       :root {
           --sidebar-bg: #131a16;
           --sidebar-hover: #1e2923;
           --sidebar-active: #23432d;
           --sidebar-text: #9ca3af;
           --bg-main: #f4f6f8;
           --text-main: #1f2937;
           --text-muted: #6b7280;
           --border-color: #e5e7eb;
           --primary: #2d5d40; 
           --danger-color: #ef4444;
           --danger-bg: #fee2e2;
           --warning-color: #f59e0b;
           --warning-bg: #fef3c7;
           --success-color: #10b981;
           --success-bg: #d1fae5;
           --info-color: #3b82f6;
       }

       * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Inter', sans-serif; }
       body { display: flex; height: 100vh; background-color: var(--bg-main); color: var(--text-main); overflow: hidden; }
       button, input, select, textarea { font: inherit; }

       /* SIDEBAR */
       .sidebar { width: 260px; background-color: var(--sidebar-bg); display: flex; flex-direction: column; flex-shrink: 0; color: white; transition: transform 0.3s ease; z-index: 1000; }
       .brand { padding: 24px; display: flex; align-items: center; gap: 16px; }
       .brand-icon { width: 44px; height: 44px; background-color: #27302a; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #fbbf24; font-size: 20px; border: 1px solid #3f4a43; }
       .brand-text h1 { font-size: 18px; font-weight: 700; letter-spacing: 0.5px; }
       .brand-text p { font-size: 12px; color: var(--sidebar-text); }
       .nav-menu { flex: 1; padding: 0 12px; display: flex; flex-direction: column; gap: 4px; overflow-y: auto; }
       .nav-item { border: none; background: transparent; display: flex; align-items: center; gap: 12px; padding: 12px 16px; color: var(--sidebar-text); text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 500; transition: all 0.2s ease; cursor: pointer; text-align: left; width: 100%; }
       .nav-item:hover { background-color: var(--sidebar-hover); color: white; }
       .nav-item.active { background-color: var(--sidebar-active); color: white; }
       .nav-item i { width: 20px; text-align: center; font-size: 16px; }
       .sidebar-footer { padding: 16px; }
       .user-profile { display: flex; align-items: center; gap: 12px; padding: 12px; background-color: #1e2923; border-radius: 8px; margin-bottom: 8px; }
       .user-avatar { width: 32px; height: 32px; background-color: #cbd5e1; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #475569; }
       .user-info h4 { font-size: 14px; font-weight: 600; color: white; }
       .user-info p { font-size: 12px; color: var(--sidebar-text); }
       .sidebar-overlay { display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0, 0, 0, 0.5); z-index: 999; }

       /* MAIN CONTENT */
       .main-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; position: relative; }
       .header { height: 72px; background-color: white; border-bottom: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between; padding: 0 24px; flex-shrink: 0; }
       .menu-btn { background: none; border: none; font-size: 20px; color: var(--text-muted); cursor: pointer; display: none; }
       .page-title h2 { font-size: 20px; font-weight: 600; }
       .page-title p { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
       .search-container { position: relative; width: 300px; }
       .search-container input { width: 100%; padding: 10px 16px 10px 40px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 14px; outline: none; }
       .search-container i { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-muted); }
       .toolbar { padding: 24px; display: flex; justify-content: flex-end; gap: 12px; flex-wrap: wrap; }
       
       .btn { padding: 8px 16px; border-radius: 6px; font-size: 14px; font-weight: 500; border: 1px solid var(--border-color); background: white; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; color: var(--text-main); transition: 0.2s; }
       .btn:hover { background-color: #f9fafb; }
       .btn-primary { background-color: var(--primary); color: white; border: none; }
       .btn-primary:hover { background-color: #1f422e; }
       .btn-danger { background-color: var(--danger-color); color: white; border: none; }
       .btn-success { background-color: var(--success-color); color: white; border: none; }
       select.btn { outline: none; appearance: none; padding-right: 32px; background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e"); background-repeat: no-repeat; background-position: right 12px center; background-size: 16px; }

       /* BOARD */
       .board { flex: 1; padding: 0 24px 24px; display: flex; gap: 24px; overflow-x: auto; overflow-y: hidden; }
       .column { width: 320px; flex-shrink: 0; display: flex; flex-direction: column; background-color: var(--bg-main); height: 100%; border-radius: 8px; }
       .column.drag-over { background-color: #e5e7eb; }
       .column-header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 16px; }
       .column-title { display: flex; align-items: center; gap: 12px; font-size: 16px; font-weight: 600; }
       .task-list { flex: 1; display: flex; flex-direction: column; gap: 16px; overflow-y: auto; padding-bottom: 16px; min-height: 150px; }
       
       .count-badge { width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: bold; }
       [data-status="pending"] .count-badge { background-color: var(--danger-color); }
       [data-status="progress"] .count-badge { background-color: var(--info-color); }
       [data-status="done"] .count-badge { background-color: var(--success-color); }

       /* CARDS */
       .card { background: white; border-radius: 8px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); border-top: 4px solid transparent; display: flex; flex-direction: column; gap: 12px; cursor: pointer; transition: 0.2s; }
       .card:hover { transform: translateY(-2px); }
       .card.dragging { opacity: 0.5; }
       .card-pending { border-top-color: var(--danger-color); }
       .card-progress { border-top-color: var(--info-color); }
       .card-done { border-top-color: var(--success-color); }
       .card-top { display: flex; justify-content: space-between; align-items: center; }
       .task-id { font-size: 12px; font-weight: 600; }
       .card-pending .task-id { color: var(--danger-color); }
       .card-progress .task-id { color: var(--info-color); }
       .card-done .task-id { color: var(--success-color); }
       
       .tag { padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
       .tag-high { background-color: var(--danger-bg); color: var(--danger-color); }
       .tag-medium { background-color: var(--warning-bg); color: var(--warning-color); }
       .tag-low { background-color: var(--success-bg); color: #059669; }
       .card-title { font-size: 14px; font-weight: 600; color: var(--text-main); }
       .card-infos { display: flex; justify-content: space-between; font-size: 12px; color: var(--text-muted); }
       .info-item { display: flex; align-items: center; gap: 6px; }
       .card-footer { display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: var(--text-muted); padding-top: 12px; border-top: 1px solid var(--border-color); }
       .add-task-btn { background: transparent; border: 1px dashed #cbd5e1; padding: 12px; border-radius: 8px; color: var(--text-muted); cursor: pointer; width: 100%; margin-top: auto; }

       /* DROPDOWN LOTE */
       .dropdown { position: relative; display: inline-block; }
       .dropdown-btn { background: transparent; border: none; font-size: 16px; color: var(--text-muted); cursor: pointer; padding: 4px 8px; }
       .dropdown-content { display: none; position: absolute; right: 0; top: 100%; background-color: #fff; min-width: 200px; box-shadow: 0px 4px 15px rgba(0,0,0,0.1); z-index: 20; border-radius: 8px; border: 1px solid var(--border-color); overflow: hidden; }
       .dropdown-content a { color: var(--text-main); padding: 12px 16px; text-decoration: none; display: block; font-size: 13px; cursor: pointer; }
       .dropdown-content a:hover { background-color: var(--bg-main); }
       .dropdown:hover .dropdown-content { display: block; }
       .task-check { width: 16px; height: 16px; cursor: pointer; accent-color: var(--primary); }

       /* MODAIS */
       .modal-bg { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.6); display: none; align-items: center; justify-content: center; padding: 20px; z-index: 2000; backdrop-filter: blur(2px); }
       .modal-bg.show { display: flex; }
       .modal { background: white; width: 100%; max-width: 650px; max-height: 92vh; overflow-y: auto; border-radius: 12px; padding: 24px; }
       .modal h2 { margin-bottom: 24px; font-size: 20px; font-weight: 600; }
       .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
       .field.full { grid-column: 1 / -1; }
       .field label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; }
       .field input, .field select, .field textarea { width: 100%; border: 1px solid var(--border-color); border-radius: 8px; padding: 10px 12px; outline: none; }
       .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--border-color); }

       /* DETALHES */
       .detail-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
       .detail-id { color: var(--primary); font-weight: 700; font-size: 13px; }
       .close-x { border: none; background: transparent; font-size: 24px; cursor: pointer; }
       .detail-section { margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--border-color); }
       .detail-section h4 { font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 12px; }
       
       .status-row { display: flex; gap: 8px; }
       .status-btn { padding: 8px 16px; border: 1px solid var(--border-color); background: white; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 13px; }
       .status-btn.active.pending { background: var(--danger-color); color: white; border-color: var(--danger-color); }
       .status-btn.active.progress { background: var(--info-color); color: white; border-color: var(--info-color); }
       .status-btn.active.done { background: var(--success-color); color: white; border-color: var(--success-color); }

       .progress-controls { display: flex; align-items: center; gap: 16px; }
       .progress-controls input[type="range"] { flex: 1; accent-color: var(--primary); }
       .big-progress { height: 10px; background: #e5e7eb; border-radius: 10px; overflow: hidden; margin: 12px 0; }
       .big-progress-fill { height: 100%; background: var(--info-color); width: 0; }
       
       .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
       .info-box { background: var(--bg-main); border-radius: 8px; padding: 12px; border: 1px solid var(--border-color); }
       .info-box small { display: block; color: var(--text-muted); font-size: 12px; }
       
       /* ANEXOS ÁREA */
       .file-dropzone { border: 2px dashed #cbd5e1; padding: 20px; border-radius: 8px; text-align: center; background: var(--bg-main); cursor: pointer; transition: 0.2s; }
       .file-dropzone:hover { border-color: var(--primary); background: #fff; }
       .file-list { margin-top: 12px; display: flex; flex-direction: column; gap: 8px; }
       .file-item { display: flex; justify-content: space-between; align-items: center; background: var(--bg-main); padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); font-size: 13px; }
       .file-item a { color: var(--primary); text-decoration: none; font-weight: 600; }
       .file-item button { background: transparent; border: none; color: var(--danger-color); cursor: pointer; }

       .timeline { display: flex; flex-direction: column; gap: 16px; }
       .timeline-item { border-left: 3px solid #cbd5e1; padding-left: 16px; position: relative; }
       .timeline-item::before { content: ''; position: absolute; left: -7px; top: 0; width: 11px; height: 11px; border-radius: 50%; background: #cbd5e1; border: 2px solid white; }
       .timeline-item .time { color: var(--text-muted); font-size: 12px; }

       .main-footer { text-align: center; padding: 12px; font-size: 12px; color: var(--text-muted); background-color: white; border-top: 1px solid var(--border-color); }
   </style>
</head>
<body>

   <!-- SIDEBAR -->
   <aside class="sidebar" id="sidebar">
       <div class="brand">
           <div class="brand-icon"><i class="fa-solid fa-star"></i></div>
           <div class="brand-text">
               <h1>TAREFAS</h1>
               <p>26º Pel PE Mec</p>
           </div>
       </div>
       <nav class="nav-menu">
           <button class="nav-item active"><i class="fa-solid fa-table-cells-large"></i> Quadro Cloud</button>
       </nav>
       <div class="sidebar-footer">
           <div class="user-profile">
               <div class="user-avatar"><i class="fa-solid fa-user"></i></div>
               <div class="user-info">
                   <h4>Sd Silva</h4>
                   <p>S3 - Auxiliar</p>
               </div>
           </div>
       </div>
   </aside>

   <!-- MAIN CONTENT -->
   <main class="main-content">
       <header class="header">
           <div class="header-left">
               <button class="menu-btn" id="menuBtn"><i class="fa-solid fa-bars"></i></button>
               <div class="page-title">
                   <h2>Quadro Sincronizado (Supabase)</h2>
                   <p>Início > Nuvem</p>
               </div>
           </div>
           <div class="header-right">
               <div class="search-container">
                   <i class="fa-solid fa-magnifying-glass"></i>
                   <input type="text" id="search" placeholder="Buscar tarefas...">
               </div>
           </div>
       </header>

       <div class="toolbar">
           <select class="btn" id="sectionFilter">
               <option value="">Todas as seções</option>
               <option>S1</option>
               <option>S2</option>
               <option>S3</option>
               <option>S4</option>
               <option>Fiscalização</option>
               <option>Pagamento</option>
               <option>SALC</option>
               <option>Garagem</option>
               <option>ResMat</option>
               <option>ResArmt</option>
               <option>Informática</option>
           </select>
           <button class="btn btn-primary" id="newTask"><i class="fa-solid fa-plus"></i> Nova tarefa</button>
       </div>

       <div class="board">
           <!-- PENDENTES -->
           <div class="column" data-status="pending">
               <div class="column-header">
                   <div class="column-title">Pendentes <span class="count-badge">0</span></div>
                   <div class="dropdown">
                       <button class="dropdown-btn"><i class="fa-solid fa-ellipsis-vertical"></i></button>
                       <div class="dropdown-content">
                           <a onclick="concluirSelecionadas('pending')"><i class="fa-solid fa-check"></i> Concluir em lote</a>
                           <a onclick="excluirSelecionadas('pending')"><i class="fa-regular fa-trash-can"></i> Excluir em lote</a>
                       </div>
                   </div>
               </div>
               <div class="task-list"></div>
               <button class="add-task-btn"><i class="fa-solid fa-plus"></i> Adicionar tarefa</button>
           </div>

           <!-- EM ANDAMENTO -->
           <div class="column" data-status="progress">
               <div class="column-header">
                   <div class="column-title">Em andamento <span class="count-badge">0</span></div>
                   <div class="dropdown">
                       <button class="dropdown-btn"><i class="fa-solid fa-ellipsis-vertical"></i></button>
                       <div class="dropdown-content">
                           <a onclick="concluirSelecionadas('progress')"><i class="fa-solid fa-check"></i> Concluir em lote</a>
                           <a onclick="excluirSelecionadas('progress')"><i class="fa-regular fa-trash-can"></i> Excluir em lote</a>
                       </div>
                   </div>
               </div>
               <div class="task-list"></div>
               <button class="add-task-btn"><i class="fa-solid fa-plus"></i> Adicionar tarefa</button>
           </div>

           <!-- CONCLUÍDAS -->
           <div class="column" data-status="done">
               <div class="column-header">
                   <div class="column-title">Concluídas <span class="count-badge">0</span></div>
                   <div class="dropdown">
                       <button class="dropdown-btn"><i class="fa-solid fa-ellipsis-vertical"></i></button>
                       <div class="dropdown-content">
                           <a onclick="excluirSelecionadas('done')"><i class="fa-regular fa-trash-can"></i> Excluir em lote</a>
                       </div>
                   </div>
               </div>
               <div class="task-list"></div>
               <button class="add-task-btn"><i class="fa-solid fa-plus"></i> Adicionar tarefa</button>
           </div>
       </div>

       <footer class="main-footer">
           <i class="fa-solid fa-cloud"></i> Sincronizado em tempo real com o banco de dados Supabase do 26º Pel PE Mec.
       </footer>
   </main>

   <!-- MODAL: NOVA TAREFA -->
   <div class="modal-bg" id="modal">
       <div class="modal">
           <div class="detail-header">
               <h2>Nova tarefa</h2>
               <button class="close-x" id="cancel">×</button>
           </div>
           <form id="taskForm">
               <div class="form-grid">
                   <div class="field full"><label>Título *</label><input id="taskTitle" required></div>
                   <div class="field full"><label>Descrição</label><textarea id="taskDescription"></textarea></div>
                   <div class="field">
                       <label>Seção</label>
                       <select id="taskSection">
                           <option>S1</option><option>S2</option><option>S3</option><option>S4</option>
                           <option>Fiscalização</option><option>Pagamento</option><option>SALC</option>
                       </select>
                   </div>
                   <div class="field"><label>Responsável</label><input id="taskResponsible" value="Sd Silva"></div>
                   <div class="field">
                       <label>Prioridade</label>
                       <select id="taskPriority"><option value="high">Alta</option><option value="medium" selected>Média</option><option value="low">Baixa</option></select>
                   </div>
                   <div class="field"><label>Prazo</label><input id="taskDue" type="date"></div>
               </div>
               <div class="modal-actions">
                   <button type="button" class="btn" id="cancel2">Cancelar</button>
                   <button type="submit" class="btn btn-primary">Salvar no Banco</button>
               </div>
           </form>
       </div>
   </div>

   <!-- MODAL: GERENCIAR TAREFA -->
   <div class="modal-bg" id="detailModal">
       <div class="modal">
           <div class="detail-header">
               <div><div class="detail-id" id="detailId">#0000</div><h2 id="detailTitle">Tarefa</h2></div>
               <button class="close-x" id="closeDetail">×</button>
           </div>

           <div class="detail-section">
               <h4>Status da Tarefa</h4>
               <div class="status-row">
                   <button class="status-btn pending" data-status="pending">🔴 Pendente</button>
                   <button class="status-btn progress" data-status="progress">🔵 Em andamento</button>
                   <button class="status-btn done" data-status="done">🟢 Concluída</button>
               </div>
           </div>

           <div class="detail-section">
               <h4>Andamento</h4>
               <div class="progress-controls">
                   <input type="range" id="progressRange" min="0" max="100">
                   <strong id="progressNumber">0%</strong>
               </div>
               <div class="big-progress"><div class="big-progress-fill" id="bigProgressFill"></div></div>
           </div>

           <!-- NOVO: SEÇÃO DE ARQUIVOS ANEXOS -->
           <div class="detail-section">
               <h4>Arquivos Anexos</h4>
               <div class="file-dropzone" onclick="document.getElementById('fileInput').click()">
                   <i class="fa-solid fa-cloud-arrow-up" style="font-size:24px; color:var(--text-muted)"></i>
                   <p style="font-size:13px; margin-top:8px">Clique para carregar arquivos administrativos (Max: 5MB)</p>
                   <input type="file" id="fileInput" style="display:none">
               </div>
               <div class="file-list" id="fileList"></div>
           </div>

           <div class="detail-section">
               <h4>Informações</h4>
               <div class="info-grid">
                   <div class="info-box"><small>Seção</small><strong id="detailSection">-</strong></div>
                   <div class="info-box"><small>Responsável</small><strong id="detailResponsible">-</strong></div>
                   <div class="info-box"><small>Prioridade</small><strong id="detailPriority">-</strong></div>
                   <div class="info-box"><small>Prazo</small><strong id="detailDue">-</strong></div>
               </div>
           </div>

           <div class="detail-section">
               <h4>Histórico / Linha do tempo</h4>
               <div class="timeline" id="timeline"></div>
           </div>

           <div class="detail-section">
               <textarea id="updateText" placeholder="Adicionar comentário ao histórico..." style="width:100%; padding:10px; border-radius:8px; border:1px solid var(--border-color); outline:none;"></textarea>
               <button class="btn btn-primary" id="addUpdate" style="margin-top:10px">Enviar Comentário</button>
           </div>

           <div style="display:flex; justify-content:space-between; margin-top:24px; padding-top:20px; border-top:1px solid var(--border-color);">
               <button class="btn btn-danger" id="deleteTask">Excluir</button>
               <button class="btn btn-success" id="saveDetail">Salvar Alterações</button>
           </div>
       </div>
   </div>

   <script>
       // Configuração das Credenciais fornecidas pelo Usuário
       const SUPABASE_URL = "https://bpvijatnsluwsgnzklrd.supabase.co";
       const SUPABASE_KEY = "sb_publishable_r7M3twr5mKmbYqP14HGpVQ_ruI0QB_p";
       const supabase = Supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

       const labels = { high: "Alta", medium: "Média", low: "Baixa" };
       let tasks = [];
       let draggedId = null;
       let selectedTaskId = null;
       let currentAttachments = [];

       function now(){ 
           const d = new Date(); 
           return d.toLocaleDateString("pt-BR") + " " + d.toLocaleTimeString("pt-BR", {hour:"2-digit", minute:"2-digit"}); 
       }

       // Carregar dados direto do Supabase Cloud
       async function fetchTasks() {
           const { data, error } = await supabase.from('tarefas').select('*').order('id', { ascending: true });
           if (!error && data) {
               tasks = data;
               render();
           }
       }

       function render() {
           document.querySelectorAll(".task-list").forEach(x => x.innerHTML="");
           const query = document.getElementById("search").value.toLowerCase();
           const section = document.getElementById("sectionFilter").value;

           tasks.forEach(t => {
               const text = (t.title + " " + t.section + " " + t.responsible).toLowerCase();
               if (!text.includes(query) || (section && t.section !== section)) return;

               const col = document.querySelector(`[data-status="${t.status}"] .task-list`);
               if(!col) return;

               const hasFiles = t.attachments && t.attachments.length > 0;
               const el = document.createElement("div");
               el.className = `card card-${t.status}`;
               el.draggable = true;
               
               el.innerHTML = `
                   <div class="card-top">
                       <div style="display:flex; align-items:center; gap:8px;">
                           <input type="checkbox" class="task-check" data-id="${t.id}" onclick="event.stopPropagation()">
                           <span class="task-id">#${String(t.id).padStart(4,"0")}</span>
                       </div>
                       <span class="tag tag-${t.priority}">${labels[t.priority]}</span>
                   </div>
                   <div class="card-title">${t.title}</div>
                   <div class="card-infos">
                       <div class="info-item"><i class="fa-solid fa-building-columns"></i> ${t.section}</div>
                       <div class="info-item"><i class="fa-regular fa-user"></i> ${t.responsible}</div>
                   </div>
                   <div class="card-footer">
                       <div class="info-item"><i class="fa-regular fa-calendar"></i> ${t.due || 'Sem prazo'}</div>
                       ${hasFiles ? '<div class="info-item" style="color:var(--primary)"><i class="fa-solid fa-paperclip"></i></div>' : ''}
                   </div>
               `;

               el.addEventListener("click", () => openDetail(t.id));
               el.addEventListener("dragstart", () => draggedId = t.id);
               col.appendChild(el);
           });

           // Atualizar os contadores numéricos superiores de cada coluna
           document.querySelectorAll(".column").forEach(c => {
               const status = c.dataset.status;
               c.querySelector(".count-badge").textContent = tasks.filter(t => t.status === status).length;
           });
       }

       // Criar tarefa no Banco de Dados
       document.getElementById("taskForm").addEventListener("submit", async (e) => {
           e.preventDefault();
           const date = document.getElementById("taskDue").value;
           const formatted = date ? date.split("-").reverse().join("/") : "Sem prazo";

           const newTask = {
               title: document.getElementById("taskTitle").value,
               description: document.getElementById("taskDescription").value,
               section: document.getElementById("taskSection").value,
               responsible: document.getElementById("taskResponsible").value,
               priority: document.getElementById("taskPriority").value,
               due: formatted,
               status: "pending",
               progress: 0,
               history: [{ date: now(), user: "Sd Silva", text: "Tarefa adicionada na nuvem." }],
               attachments: []
           };

           const { error } = await supabase.from('tarefas').insert([newTask]);
           if(!error) { closeModal(); fetchTasks(); }
       });

       // Detalhes da tarefa
       function openDetail(id) {
           selectedTaskId = id;
           const task = tasks.find(t => t.id === id);
           if(!task) return;

           document.getElementById("detailId").textContent = "#" + String(task.id).padStart(4,"0");
           document.getElementById("detailTitle").textContent = task.title;
           document.getElementById("detailSection").textContent = task.section;
           document.getElementById("detailResponsible").textContent = task.responsible;
           document.getElementById("detailPriority").textContent = labels[task.priority];
           document.getElementById("detailDue").textContent = task.due;
           document.getElementById("progressRange").value = task.progress || 0;
           document.getElementById("progressNumber").textContent = (task.progress || 0) + "%";
           document.getElementById("bigProgressFill").style.width = (task.progress || 0) + "%";

           document.querySelectorAll(".status-btn").forEach(b => b.classList.toggle("active", b.dataset.status === task.status));

           // Carregar Anexos
           currentAttachments = task.attachments || [];
           renderAttachments();

           // Histórico
           const timeline = document.getElementById("timeline");
           timeline.innerHTML = "";
           (task.history || []).forEach(h => {
               const div = document.createElement("div");
               div.className = "timeline-item";
               div.innerHTML = `<div class="time">${h.date}</div><strong>${h.user}</strong><p>${h.text}</p>`;
               timeline.appendChild(div);
           });

           document.getElementById("detailModal").classList.add("show");
       }

       // Renderizar Anexos dentro do Modal
       function renderAttachments() {
           const list = document.getElementById("fileList");
           list.innerHTML = "";
           currentAttachments.forEach((file, index) => {
               const div = document.createElement("div");
               div.className = "file-item";
               div.innerHTML = `
                   <a href="${file.url}" download="${file.name}"><i class="fa-regular fa-file-lines"></i> ${file.name}</a>
                   <button onclick="removeAttachment(${index})"><i class="fa-regular fa-trash-can"></i></button>
               `;
               list.appendChild(div);
           });
       }

       // Upload e conversão local para armazenamento estruturado
       document.getElementById("fileInput").addEventListener("change", function(e) {
           const file = e.target.files[0];
           if (!file) return;
           if (file.size > 5 * 1024 * 1024) { alert("Arquivo muito grande. Limite máximo de 5MB."); return; }

           const reader = new FileReader();
           reader.onload = function(event) {
               currentAttachments.push({ name: file.name, url: event.target.result });
               renderAttachments();
           };
           reader.readAsDataURL(file);
       });

       function removeAttachment(index) {
           currentAttachments.splice(index, 1);
           renderAttachments();
       }

       // Salvar Alterações Gerais
       document.getElementById("saveDetail").addEventListener("click", async () => {
           const task = tasks.find(t => t.id === selectedTaskId);
           if(!task) return;

           const progress = parseInt(document.getElementById("progressRange").value);
           let status = task.status;
           if (progress === 100) status = "done";
           else if (progress > 0 && status === "pending") status = "progress";

           const updatedHistory = [...(task.history || []), { date: now(), user: "Sd Silva", text: "Dados e arquivos modificados." }];

           const { error } = await supabase.from('tarefas').update({
               progress: progress,
               status: status,
               attachments: currentAttachments,
               history: updatedHistory
           }).eq('id', selectedTaskId);

           if(!error) { closeDetail(); fetchTasks(); }
       });

       // Deletar Tarefa individual
       document.getElementById("deleteTask").addEventListener("click", async () => {
           if(!confirm("Tem certeza que deseja excluir esta tarefa de forma definitiva do banco de dados?")) return;
           const { error } = await supabase.from('tarefas').delete().eq('id', selectedTaskId);
           if(!error) { closeDetail(); fetchTasks(); }
       });

       // Alterar status diretamente via botões rápidos do modal
       document.querySelectorAll(".status-btn").forEach(btn => {
           btn.addEventListener("click", function() {
               document.querySelectorAll(".status-btn").forEach(b => b.classList.remove("active"));
               this.classList.add("active");
               const status = this.dataset.status;
               if(status === "done") {
                   document.getElementById("progressRange").value = 100;
                   document.getElementById("progressNumber").textContent = "100%";
               } else if(status === "pending") {
                   document.getElementById("progressRange").value = 0;
                   document.getElementById("progressNumber").textContent = "0%";
               }
           });
       });

       // Drag and Drop (Arrastar entre colunas da tela principal)
       document.querySelectorAll(".column").forEach(col => {
           col.addEventListener("dragover", e => e.preventDefault());
           col.addEventListener("drop", async e => {
               const task = tasks.find(t => t.id === draggedId);
               if(!task) return;
               
               const newStatus = col.dataset.status;
               let newProgress = task.progress;
               if(newStatus === "done") newProgress = 100;
               else if(newStatus === "pending") newProgress = 0;

               const { error } = await supabase.from('tarefas').update({ 
                   status: newStatus, 
                   progress: newProgress,
                   history: [...(task.history || []), { date: now(), user: "Sd Silva", text: `Movida para coluna: ${newStatus}` }]
               }).eq('id', draggedId);

               if(!error) fetchTasks();
           });
       });

       // Interações de Modais (Abrir/Fechar)
       function closeModal(){ document.getElementById("modal").classList.remove("show"); document.getElementById("taskForm").reset(); }
       function closeDetail(){ document.getElementById("detailModal").classList.remove("show"); }
       document.getElementById("newTask").onclick = () => document.getElementById("modal").classList.add("show");
       document.querySelectorAll(".add-task-btn").forEach(b => b.onclick = () => document.getElementById("modal").classList.add("show"));
       document.getElementById("cancel").onclick = closeModal;
       document.getElementById("cancel2").onclick = closeModal;
       document.getElementById("closeDetail").onclick = closeDetail;

       document.getElementById("search").addEventListener("input", render);
       document.getElementById("sectionFilter").addEventListener("change", render);

       // Inicialização do Sistema
       fetchTasks();
   </script>
</body>
</html>