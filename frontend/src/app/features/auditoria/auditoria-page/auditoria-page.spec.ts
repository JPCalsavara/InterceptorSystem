import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditoriaPageComponent } from './auditoria-page.component';

describe('AuditoriaPageComponent', () => {
  let component: AuditoriaPageComponent;
  let fixture: ComponentFixture<AuditoriaPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuditoriaPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuditoriaPageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
