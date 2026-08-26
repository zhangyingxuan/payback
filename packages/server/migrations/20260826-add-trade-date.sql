-- 先备份数据库，再在生产环境执行一次。
ALTER TABLE short_term_data ADD COLUMN tradeDate date NULL COMMENT '交易日期';
ALTER TABLE special_stock ADD COLUMN tradeDate date NULL COMMENT '交易日期';
ALTER TABLE market_data ADD COLUMN tradeDate date NULL COMMENT '交易日期';
ALTER TABLE funds_data ADD COLUMN tradeDate date NULL COMMENT '交易日期';
ALTER TABLE plate_data ADD COLUMN tradeDate date NULL COMMENT '交易日期';

UPDATE short_term_data SET tradeDate = DATE(createTime) WHERE tradeDate IS NULL;
UPDATE special_stock SET tradeDate = DATE(createTime) WHERE tradeDate IS NULL;
UPDATE market_data SET tradeDate = DATE(createTime) WHERE tradeDate IS NULL;
UPDATE funds_data SET tradeDate = DATE(createTime) WHERE tradeDate IS NULL;
UPDATE plate_data SET tradeDate = DATE(createTime) WHERE tradeDate IS NULL;

DELETE old FROM short_term_data old JOIN short_term_data keep ON old.tradeDate = keep.tradeDate AND old.id < keep.id;
DELETE old FROM special_stock old JOIN special_stock keep ON old.tradeDate = keep.tradeDate AND old.id < keep.id;
DELETE old FROM market_data old JOIN market_data keep ON old.tradeDate = keep.tradeDate AND old.id < keep.id;
DELETE old FROM funds_data old JOIN funds_data keep ON old.tradeDate = keep.tradeDate AND old.id < keep.id;
DELETE old FROM plate_data old JOIN plate_data keep ON old.tradeDate = keep.tradeDate AND old.id < keep.id;

ALTER TABLE short_term_data ADD UNIQUE INDEX IDX_short_term_trade_date (tradeDate);
ALTER TABLE special_stock ADD UNIQUE INDEX IDX_special_stock_trade_date (tradeDate);
ALTER TABLE market_data ADD UNIQUE INDEX IDX_market_trade_date (tradeDate);
ALTER TABLE funds_data ADD UNIQUE INDEX IDX_funds_trade_date (tradeDate);
ALTER TABLE plate_data ADD UNIQUE INDEX IDX_plate_trade_date (tradeDate);
