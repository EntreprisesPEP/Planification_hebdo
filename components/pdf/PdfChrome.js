import { View, Text, Image } from '@react-pdf/renderer';
import { pdfStyles } from '../../lib/pdfStyles';
import { fmtDateLong } from '../../lib/dates';

export function PdfHeader({ title, subtitle, fixed }) {
  return (
    <View style={pdfStyles.header} fixed={fixed}>
      <Image src="/logo-pep.png" style={pdfStyles.logo} />
      <View>
        <Text style={pdfStyles.headerTitle}>{title}</Text>
        {subtitle && <Text style={pdfStyles.headerSubtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
}

export function PdfFooter({ fixed }) {
  return (
    <View style={pdfStyles.footer} fixed={fixed}>
      <Text>Les Entreprises PEP2000</Text>
      <Text>Genere le {fmtDateLong(new Date())}</Text>
    </View>
  );
}
