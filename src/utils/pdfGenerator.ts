import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ==========================================
// 1. FACTURE DE SORTIE (Dashboard Client)
// ==========================================
interface InvoiceData {
  id: string;
  warehouseName: string;
  articleName: string;
  sku: string;
  quantity: number;
  clientReference: string;
  date: string;
  userEmail: string;
}

export const generateExitSlip = (data: InvoiceData) => {
  const doc = new jsPDF();

  doc.setFontSize(22);
  doc.setTextColor(40, 40, 40);
  doc.text("WMS OPTIMA", 20, 20);
  
  doc.setFontSize(10);
  doc.text("Gestion d'Entrepôt & Logistique", 20, 25);
  doc.text("contact@wms-optima.com", 20, 30);

  doc.setFontSize(16);
  doc.setTextColor(220, 38, 38); 
  doc.text("BON DE SORTIE / FACTURE", 140, 20);

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text(`N° Mouvement : ${data.id.substring(0, 8).toUpperCase()}`, 140, 30);
  doc.text(`Date : ${data.date}`, 140, 35);
  doc.text(`Entrepôt : ${data.warehouseName}`, 140, 40);
  doc.text(`Opérateur : ${data.userEmail}`, 140, 45);

  doc.setDrawColor(200, 200, 200);
  doc.line(20, 55, 190, 55);
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`Référence Client / Motif : ${data.clientReference}`, 20, 65);

  // @ts-ignore
  autoTable(doc, {
    startY: 75,
    head: [['SKU', 'Désignation Article', 'Quantité Sortie', 'Unité']],
    body: [
      [data.sku, data.articleName, data.quantity, "Unités"],
    ],
    theme: 'grid',
    headStyles: { fillColor: [66, 66, 66] },
    styles: { fontSize: 11, cellPadding: 5 },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 20;
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Signature du responsable :", 140, finalY);
  doc.line(140, finalY + 15, 190, finalY + 15); 

  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text("Ce document sert de justificatif de sortie de stock. Merci de votre confiance.", 105, 280, { align: "center" });

  doc.save(`Facture_Sortie_${data.clientReference}.pdf`);
};

// ==========================================
// 2. CONTRAT DE LOCATION (Admin Panel)
// ==========================================
interface RegistrationData {
  email: string;
  password: string;
  warehouseName: string;
  zone: string;
  adminName: string;
  monthlyPrice: number;
  companyName: string;
  fullName: string;
  phone: string;
}

export const generateRegistrationDoc = (data: RegistrationData) => {
  const doc = new jsPDF();

  // 1. En-tête
  doc.setFillColor(30, 41, 59); 
  doc.rect(0, 0, 210, 40, 'F'); 
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("WMS OPTIMA", 20, 25);
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Contrat de Prestation Logistique (3PL)", 110, 25);

  // 2. Message d'introduction
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.text(`Bienvenue, ${data.companyName} !`, 20, 55);
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("Ce document officialise l'ouverture de votre compte et l'allocation de votre espace.", 20, 62);

  // --- ENCART 1 : L'ENTREPRISE ---
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(20, 75, 170, 35, 3, 3, 'FD');

  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.setFont("helvetica", "bold");
  doc.text("Informations du Client", 25, 85);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.text(`Raison Sociale : ${data.companyName}`, 25, 95);
  doc.text(`Contact principal : ${data.fullName || 'Non renseigné'}`, 25, 102);
  doc.text(`Téléphone : ${data.phone || 'Non renseigné'}`, 120, 95);

  // --- ENCART 2 : LES IDENTIFIANTS ---
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(20, 115, 170, 35, 3, 3, 'FD');

  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.setFont("helvetica", "bold");
  doc.text("Accès à la Plateforme", 25, 125);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.text(`Identifiant (Email) : ${data.email}`, 25, 135);
  doc.text(`Mot de passe provisoire : ${data.password}`, 25, 142);

  // --- ENCART 3 : LA LOGISTIQUE & FACTURATION ---
  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(191, 219, 254);
  doc.roundedRect(20, 155, 170, 45, 3, 3, 'FD');

  doc.setFontSize(12);
  doc.setTextColor(30, 58, 138); 
  doc.setFont("helvetica", "bold");
  doc.text("Emplacement & Facturation", 25, 165);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.text(`Site Logistique assigné : ${data.warehouseName}`, 25, 175);
  doc.text(`Zone de Stockage réservée : ${data.zone}`, 25, 182);
  
  // LE PRIX
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(16, 185, 129); // Vert Emeraude
  doc.text(`Redevance Mensuelle : ${data.monthlyPrice.toLocaleString('fr-FR')} € HT / mois`, 25, 192);

  // 4. Pied de page
  const date = new Date().toLocaleDateString('fr-FR');
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.setFont("helvetica", "normal");
  doc.text(`Fait le ${date}. Document généré par l'administration WMS (${data.adminName}).`, 20, 280);

  // Nom du fichier dynamique et propre
  const safeCompanyName = data.companyName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  doc.save(`Contrat_WMS_${safeCompanyName}.pdf`);
};