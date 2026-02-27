import { Component } from '@angular/core';
import { MainLayout } from '../../layout/main-layout/main-layout';
import { CardModule } from 'primeng/card';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-group',
  standalone: true,
  imports: [MainLayout, CardModule, InputNumberModule, FormsModule],
  templateUrl: './group.html',
  styleUrl: './group.scss',
})
export class Group {
  totalValue: number = 0;
}
