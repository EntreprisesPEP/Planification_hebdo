import { Page, View, Text } from '@react-pdf/renderer';
import { pdfStyles, LINE } from '../../lib/pdfStyles';
import { JOURS, dateKey, twoWeekDates, fmtDateLong } from '../../lib/dates';
import { PdfHeader, PdfFooter } from './PdfChrome';

const CM_W = 12;
const DAY_W = (100 - CM_W) / 7;

function WeekTable({ title, dates, contremaitres, getAssignment, activeProjects }) {
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={pdfStyles.sectionTitle}>{title}</Text>
      <View style={[pdfStyles.table, { borderColor: LINE }]}>
        <View style={pdfStyles.row}>
          <Text style={[pdfStyles.th, { width: `${CM_W}%` }]}>Contremaitre</Text>
          {dates.map((d) => (
            <Text key={dateKey(d)} style={[pdfStyles.th, { width: `${DAY_W}%`, textAlign: 'center' }]}>
              {JOURS[d.getDay()]} {fmtDateLong(d)}
            </Text>
          ))}
        </View>
        {contremaitres.map((c) => (
          <View key={c.id} style={pdfStyles.row} wrap={false}>
            <Text style={[pdfStyles.tdBold, { width: `${CM_W}%` }]}>{c.nom}</Text>
            {dates.map((d) => {
              const dIso = dateKey(d);
              const projectId = getAssignment(c.id, dIso);
              const proj = activeProjects.find((p) => p.id === projectId);
              return (
                <Text key={dIso} style={[pdfStyles.td, { width: `${DAY_W}%`, textAlign: 'center' }]}>
                  {proj ? proj.projet : '\u2014'}
                </Text>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

export default function Meeting2Pdf({ board }) {
  const { contremaitres, settings, getAssignment, projects } = board;
  const activeProjects = projects.filter((p) => p.statut !== 'Termine');
  const dates = twoWeekDates(settings.range_start);
  const week1 = dates.slice(0, 7);
  const week2 = dates.slice(7, 14);
  const subtitle = `Semaine 1 : ${fmtDateLong(week1[0])} - ${fmtDateLong(week1[6])}   |   Semaine 2 : ${fmtDateLong(week2[0])} - ${fmtDateLong(week2[6])}`;

  return (
    <Page size={[1224, 792]} style={pdfStyles.page}>
      <PdfHeader title="Meeting 2 - Attribution" subtitle={subtitle} fixed />

      <WeekTable title="Semaine 1" dates={week1} contremaitres={contremaitres} getAssignment={getAssignment} activeProjects={activeProjects} />
      <WeekTable title="Semaine 2" dates={week2} contremaitres={contremaitres} getAssignment={getAssignment} activeProjects={activeProjects} />

      <PdfFooter fixed />
    </Page>
  );
}
