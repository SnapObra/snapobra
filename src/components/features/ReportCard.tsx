import { Calendar, FileText, Image as ImageIcon, ChevronRight, Clock, Maximize2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Relatorio } from '../../store/reportStore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ReportCardProps {
  report: Relatorio;
}

export const ReportCard = ({ report }: ReportCardProps) => {
  const navigate = useNavigate();
  const photoCount = report.fotos?.length || 0;
  const formattedDate = format(new Date(report.date), "dd 'de' MMMM", { locale: ptBR });

  const handleCardClick = (e: React.MouseEvent) => {
    // Evita navegar se o clique foi em um elemento interativo interno (como o link público)
    const target = e.target as HTMLElement;
    if (target.closest('a') || target.closest('button')) {
      return;
    }
    navigate(`/dashboard/relatorios/${report.id}`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="group block bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden cursor-pointer"
    >
      <div className="flex">
        {/* Thumbnail area (if it has photos) */}
        <div className="w-24 h-24 sm:w-32 sm:h-32 bg-slate-100 flex-shrink-0 relative overflow-hidden bg-brand-primary/5">
          {report.fotos && report.fotos.length > 0 ? (
            <img 
              src={report.fotos[0].public_url} 
              alt={report.title} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
               <ImageIcon className="w-8 h-8 mb-1" />
               <span className="text-[8px] font-bold uppercase tracking-widest">Sem Fotos</span>
            </div>
          )}
          <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-brand-dark/60 backdrop-blur-md rounded-md text-white text-[8px] font-bold uppercase tracking-wider">
            {photoCount} FOTOS
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-1.5">
               <Calendar className="w-3 h-3" />
               <span>{formattedDate}</span>
               <span className="text-slate-200">|</span>
               <Clock className="w-3 h-3" />
               <span>{format(new Date(report.created_at), 'HH:mm')}</span>
            </div>
            <h3 className="text-sm sm:text-base font-display text-brand-dark group-hover:text-brand-primary transition-colors leading-tight line-clamp-1">
              {report.title}
            </h3>
            {report.notes && (
              <p className="text-slate-400 text-xs mt-1 line-clamp-1 font-light italic">
                "{report.notes}"
              </p>
            )}
          </div>

          <div className="flex items-center justify-between mt-4">
             <div className="flex items-center text-brand-primary text-[10px] font-bold uppercase tracking-widest">
                <FileText className="w-3 h-3 mr-1.5" />
                <span>Editar Registro</span>
             </div>
             <div className="flex gap-2">
                <Link 
                  to={`/public/relatorios/${report.id}`}
                  onClick={(e) => e.stopPropagation()} 
                  className="p-1 px-2.5 rounded-lg bg-slate-50 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/5 transition-all text-[9px] font-bold flex items-center gap-1.5"
                  title="Visualização Pública"
                >
                  <Maximize2 className="w-3 h-3" />
                  <span className="hidden sm:inline">PÚBLICO</span>
                </Link>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-brand-primary group-hover:translate-x-1 transition-all" />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
