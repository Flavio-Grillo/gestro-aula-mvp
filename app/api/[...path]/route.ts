export const dynamic = 'force-dynamic';
const disabled = () => Response.json({error:'Demonstração sem banco: use os dados fictícios da interface.'},{status:503,headers:{'Cache-Control':'no-store'}});
export const GET=disabled;export const POST=disabled;export const PATCH=disabled;
