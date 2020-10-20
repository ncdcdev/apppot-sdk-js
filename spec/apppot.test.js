import {
  AppPot
} from './config';

describe('AppPotのテスト', function(){
  it('ビルド日時が取得できる', function(){
    expect(typeof AppPot.getBuildDate()).toBe('number');
    expect(AppPot.getBuildDate()+"").toMatch(/[0-9]{10}/);
  });
  it('バージョンが取得できる', function(){
    expect(typeof AppPot.getVersion()).toBe('string');
    expect(AppPot.getVersion()).toMatch(/\d+\.\d+\.\d/);
  });
});

