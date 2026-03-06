import { Directive, Input, TemplateRef, ViewContainerRef, inject } from '@angular/core';
import { Permission } from '../../services/permission/permission';

@Directive({
  selector: '[appHasPermission]',
  standalone: true,
})
export class HasPermission {
  private templateRef = inject(TemplateRef);
  private viewContainer = inject(ViewContainerRef);
  private permissionService = inject(Permission);

  @Input() set appHasPermission(permission: string | string[]) {
    if (this.permissionService.hasPermission(permission)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}
