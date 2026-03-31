import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GuichetComponent } from './guichet';  

describe('GuichetComponent', () => { 
  let component: GuichetComponent;
  let fixture: ComponentFixture<GuichetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuichetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GuichetComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});