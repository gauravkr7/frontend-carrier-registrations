import { Component, OnInit } from '@angular/core';
import { ServiceAuthService } from '../../service/service-auth.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-saledetails',
  templateUrl: './saledetails.component.html',
  styleUrls: ['./saledetails.component.css']
})
export class SaledetailsComponent implements OnInit {
  isSidebarOpen: boolean = false;
  sales: any[] = [];
  selectedSales: any = null;
  loading: boolean = true;
  error: string | null = null;

  constructor(
    private accountingService: ServiceAuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const saleId = params.get('salesId');
      console.log('Extracted salesId from route:', saleId);
      
      if (saleId) {
        this.fetchSaleDetails(saleId);
      } else {
        this.error = 'No sale ID found in route parameters';
        this.loading = false;
        console.error(this.error);
      }
    });
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  fetchSaleDetails(saleId: string): void {
    this.loading = true;
    this.error = null;
  
    this.accountingService.getSalesOrderPermitFromAPI().subscribe({
      next: (data: any) => {
        console.log('API Response Data:', data);
        this.sales = Array.isArray(data) ? data : [data];
  
        // Case-insensitive and flexible property name matching
        this.selectedSales = this.sales.find(sale => {
          const normalizedSaleId = String(saleId).toLowerCase();
          return (
            String(sale?.saleId)?.toLowerCase() === normalizedSaleId ||
            String(sale?.SaleId)?.toLowerCase() === normalizedSaleId ||
            String(sale?.id)?.toLowerCase() === normalizedSaleId ||
            String(sale?.salesId)?.toLowerCase() === normalizedSaleId ||
            String(sale?.orderId)?.toLowerCase() === normalizedSaleId // Added orderId for matching
          );
        });
  
        if (this.selectedSales) {
          console.log('Matched Sale:', this.selectedSales);
  
          // Normalize property names
          this.selectedSales = {
            ...this.selectedSales,
            saleId: this.selectedSales.saleId || this.selectedSales.SaleId || this.selectedSales.id || this.selectedSales.orderId || saleId,
            paymentId: this.selectedSales.paymentId || this.selectedSales.paymentID,
            refrenceId: this.selectedSales.refrenceId || this.selectedSales.referenceId,
            paymentDate: this.selectedSales.paymentDate || this.selectedSales.paymentdate,
            paidAmount: this.selectedSales.paidAmount || this.selectedSales.paidamount,
            paymentMethod: this.selectedSales.paymentMethod || this.selectedSales.paymentmethod,
            vendorName: this.selectedSales.vendorName || this.selectedSales.vendorname || this.selectedSales.vendor,
            invoiceDate: this.selectedSales.invoiceDate || this.selectedSales.invoiceDate,
            amount: this.selectedSales.amount || this.selectedSales.totalAmount,
            status1: this.selectedSales.status1 || this.selectedSales.status,
            duedate: this.selectedSales.duedate || this.selectedSales.dueDate,
            transectionNotes: this.selectedSales.transectionNotes || this.selectedSales.notes,
            uploadDocument: Array.isArray(this.selectedSales.uploadDocument)
              ? this.selectedSales.uploadDocument
              : []
          };
  
          if (this.selectedSales.uploadDocument.length === 0) {
            this.fetchUploadedDocuments(saleId);
          }
        } else {
          this.error = `No sale found with ID: ${saleId}`;
          console.error(this.error);
        }
      },
      error: (err) => {
        this.error = 'Error fetching sale details';
        console.error(this.error, err);
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
  fetchUploadedDocuments(saleId: string): void {
    const formData = new FormData();
    formData.append('salesId', saleId);
  
    // Debugging: Log the FormData content
    const formDataEntries: [string, FormDataEntryValue][] = [];
    formData.forEach((value, key) => {
      formDataEntries.push([key, value]);
    });
    console.log('Uploading documents with FormData:', formDataEntries);
  
    this.accountingService.SalesuploadDocument(formData).subscribe({
      next: (documents: any[]) => {
        if (this.selectedSales) {
          this.selectedSales.uploadDocument = documents.map(doc => doc.url);
          console.log('Uploaded Documents:', this.selectedSales.uploadDocument);
        }
      },
      error: (err) => {
        console.error('Error fetching documents:', err);
        this.error = err.error?.message || 'Error uploading documents';
      }
    });
  }

  // Helper for Angular template to display type as string
  getTypeDisplay(type: any): string {
    if (!type) return 'Not Available';
    if (Array.isArray(type)) return type.join(', ');
    return type;
  }

  // Helper to calculate total amount from categories
  getCategoryTotal(categories: any[]): number {
    if (!categories || !Array.isArray(categories)) return 0;
    return categories.reduce((sum, cat) => sum + (Number(cat.amount) || 0), 0);
  }
}