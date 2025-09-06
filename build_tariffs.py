import sys,json,re
from pathlib import Path
import pandas as pd
repo=Path(__file__).resolve().parent
xlsx_path=Path(sys.argv[1]) if len(sys.argv)>1 else repo/'data-in'/'data-623-2025-07-15 2.xlsx'
out_path=repo/'data-in'/'tariffs.json'
df=pd.read_excel(xlsx_path)
def norm(s):return str(s).strip().lower().replace(' ','').replace('_','')
cols={norm(c):c for c in df.columns}
zone_col=cols.get('parkingzonenumber') or cols.get('zonenumber') or cols.get('зонаномер') or cols.get('parkingzone') or cols.get('zone')
tar_col=cols.get('tariffs') or cols.get('тарифы')
if not zone_col or not tar_col:raise SystemExit('missing columns')
def z4(s):
    s=str(s).strip()
    s=re.sub(r'^\s*0+','',s)
    return ('0000'+(s or '0'))[-4:]
prices={}
for _,row in df.iterrows():
    z=z4(row.get(zone_col,''))
    if not z:continue
    cell=row.get(tar_col,'')
    best=0
    parsed=None
    if isinstance(cell,str):
        try:parsed=json.loads(cell)
        except Exception:parsed=None
    elif isinstance(cell,(dict,list)):parsed=cell
    if isinstance(parsed,dict):parsed=[parsed]
    if isinstance(parsed,list):
        for it in parsed:
            if isinstance(it,dict):
                v=it.get('HourPrice') or it.get('hourprice') or it.get('Price') or it.get('price')
                try:v=float(str(v).replace(',','.'))
                except Exception:v=0
                if v and v>best:best=v
    if not best and isinstance(cell,str):
        nums=[float(x.replace(',','.')) for x in re.findall(r'\d+[.,]?\d*',cell)]
        for v in nums:
            if v>best:best=v
    best=int(round(best)) if best else 0
    if best>0:prices[z]=max(prices.get(z,0),best)
out_path.write_text(json.dumps(prices,ensure_ascii=False,indent=2),encoding='utf-8')
print('ok',len(prices),'->',out_path)
