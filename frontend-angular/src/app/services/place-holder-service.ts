import { Service, signal } from '@angular/core';

export type PlaceHolderPosition = 'before' | 'after';

@Service()
export class PlaceHolderService {
  overId = signal<string>('');
  position = signal<PlaceHolderPosition>('after');
  targetId = signal<string>('');

  setPlaceHolder(overId: string, position: PlaceHolderPosition, targetId: string) {
    this.overId.set(overId);
    this.position.set(position);
    this.targetId.set(targetId);
  }
  removePlaceHolder() {
    this.overId.set('');
    this.targetId.set('');
  }
}
