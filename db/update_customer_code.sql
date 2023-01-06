DELIMITER //

create procedure P1()

BEGIN

DECLARE i          INT;
DECLARE l_finished INT DEFAULT 0;
DECLARE l_customerid INT;

DECLARE c1 CURSOR FOR SELECT 
	c.id
	FROM   companies c
	WHERE  c.syscompanytypes_id = 4702 AND c.parent_id = 10003;

DECLARE CONTINUE HANDLER FOR NOT FOUND SET l_finished = 1;

OPEN c1;

SET i = 100000;
mainloop: LOOP

	FETCH c1 INTO l_customerid;
	
	IF l_finished = 0 THEN
		SET i = i + 1;
		UPDATE companies SET code = i WHERE id = l_customerid;

	ELSE

		LEAVE mainloop;
	
	END IF;

END LOOP mainloop;

CLOSE c1;

END;
//

DELIMITER ;
show warnings;
