(()=>{
  const nativeFetch=window.fetch.bind(window);
  const projectBase=(()=>{
    const p=location.pathname;
    const markers=['/admin','/student','/examiner'];
    for(const marker of markers){const i=p.indexOf(marker);if(i>=0)return p.slice(0,i+1)||'/';}
    return p.endsWith('/')?p:p.slice(0,p.lastIndexOf('/')+1)||'/';
  })();
  window.examproBase=projectBase;
  const resolveProjectUrl=(value)=>{
    const raw=String(value);
    if(raw.startsWith('/'))return projectBase+raw.replace(/^\/+/, '');
    return raw;
  };
  window.fetch=(input,options={})=>{
    const raw=typeof input==='string'?input:(input&&input.url)||'';
    const url=resolveProjectUrl(raw);
    const isApi=/\/api\//.test(url);
    const token=sessionStorage.getItem('examproToken');
    const opts={...options};
    if(token&&isApi){const headers=new Headers(options.headers||(input instanceof Request?input.headers:undefined));headers.set('Authorization','Bearer '+token);opts.headers=headers;}
    return nativeFetch(url,opts).then(response=>{
      if(response.status===401&&token&&isApi&&!/signin/.test(url)){
        sessionStorage.removeItem('examproToken');sessionStorage.removeItem('examproStudent');
        localStorage.removeItem('examproExaminer');
        const p=location.pathname;
        location.href=p.includes('/admin')?projectBase+'admin':p.includes('/examiner')?projectBase+'examiner':projectBase+'student';
      }
      return response;
    });
  };
  window.downloadAuthed=async(url,name)=>{
    const response=await fetch(url);
    if(!response.ok){alert('Download failed. Please sign in again.');return;}
    const a=document.createElement('a');a.href=URL.createObjectURL(await response.blob());const disposition=response.headers.get('Content-Disposition')||'';const match=disposition.match(/filename=\"?([^\";]+)\"?/i);a.download=match?match[1]:name;a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  };
})();
