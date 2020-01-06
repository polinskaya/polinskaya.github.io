using Assets.Scripts.EventSystem;
using UnityEngine;

public class SwitchPosition : MonoBehaviour
{
    float minAngle = 45;
    float maxAngle = 0;

    float speed = 5f;

    //float currentPos; 
    float currentAngle = 0;

    private enum State
    {
        off,
        on,
        turnToOff,
        turnToOn
    }

    State state = State.off;

    void OnEnable()//при включении/содании объекта
    {
        EventManager.Switch += ChangeState;//подписались на событие 
        EventManager.SwitchWork(false);
    }

    void ChangeState(bool work)
    {
        if (work && state == State.off) state = State.turnToOn;
        else if (!work && state == State.on) state = State.turnToOff;

        if (!work && state == State.off) state = State.turnToOff;
    }

    void FixedUpdate()
    {
        if (state == State.turnToOn)
        {
            currentAngle -= speed;
            if (currentAngle > maxAngle)
            {
                transform.localEulerAngles = new Vector3(currentAngle, 0, 0);
            }
            else state = State.on;
        }

        if (state == State.turnToOff)
        {
            currentAngle += speed;
            if (currentAngle < minAngle)
            {
                transform.localEulerAngles = new Vector3(currentAngle, 0, 0);
            }
            else
            {
                state = State.off;
            }
        }
    }
}




