from pathlib import Path
for path in ['pessoal_v7.js','ferias_dispensas_v721.js','aditamento_v74.js']:
    p=Path(path); s=p.read_text(encoding='utf-8')
    s=s.replace('addDays(v.data_fim,1)', 'adaptationDate(v.data_fim)')
    p.write_text(s,encoding='utf-8')
