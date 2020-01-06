using Assets.Scripts.EventSystem;
using UnityEngine;
using UnityEngine.UI;

public class Tasks : MonoBehaviour
{
    [SerializeField]
    Text taskText;
    Image myimage;

    [SerializeField]
    Text nameOfColor;

    [SerializeField]
    Button addButton;
    [SerializeField]
    Image addButtonImage;

    [SerializeField]
    Button tableButton;
    [SerializeField]
    Image tableButtonImage;
    [SerializeField]

    Button clearTableButton;
    [SerializeField]
    Image clearTableButtonImage;

    [SerializeField]
    GameObject inputArea;

    bool isWorking;
    float currentColor;

    bool wasTaskControl;

    int numberOfTask = 0;

    private void Start()
    {
        myimage = GetComponent<Image>();
        myimage.enabled = false;
        taskText.enabled = false;
        nameOfColor.enabled = false;
        addButton.GetComponent<Image>().enabled = false;
        tableButton.GetComponent<Image>().enabled = false;
        clearTableButton.GetComponent<Image>().enabled = false;
        addButtonImage.enabled = false;
        tableButtonImage.enabled = false;
        clearTableButtonImage.enabled = false;
        inputArea.SetActive(false);
        taskText.text = ++numberOfTask + ". " + "Включите установку. Перевести переключатель на осцилографе рядом с зеленым индикатором в верхнее положение.";

        EventManager.Switch += WorkingControl;
        EventManager.AmpChanger += AmpControl;

        EventManager.Switch += Task1;
    }

    void WorkingControl(bool work)//постоянно отслеживаем включена ли установка
    {
        isWorking = work;
    }

    void AmpControl(float color)
    {
        currentColor = color;
        nameOfColor.text = "Сила тока: " + NameOfColor(currentColor);
    }

    string NameOfColor(float color)
    {
        if (color == 1)
        {
            return "0.1 A";
        }

        if (color == 2)
        {
            return "0.2 A";
        }

        if (color == 3)
        {
            return "0.3 A";
        }

        if (color == 4)
        {
            return "0.4 A";
        }

        if (color == 5)
        {
            return "0.5 A";
        }
        if (color == 6)
        {
            return "0.6 A";
        }

        return "";
    }

    void Task1(bool w)
    {
        if (w)
        {
            EventManager.Switch -= Task1;
            taskText.text = ++numberOfTask + ". " + "Поворотом ручки ЛАТР, установите ток в 0,1 Ампер.(нажать левой кнопкой мыши на ручку и оттягивать в правую сторону)";
            EventManager.AmpChanger += Task2;
            Open();
        }
    }


    void Task2(float color)
    {
        if (color == 1)
        {
            EventManager.AmpChanger -= Task2;
            taskText.text = ++numberOfTask + ". " + "Впишите в таблицу значение Xk с графика гистерезиса с осцилографа, при силе тока в 0.1 А. Чтобы правильно снять показания, посмотрите на доску с обозначениями.(посчитать кол-во делений и умножить на 0.2 для внесения в таблицу)";
            EventManager.WritingValue += Task4;
            Open();
        }
    }

    bool Task4()
    {
        if (TaskControl(1))
        {
            EventManager.WritingValue -= Task4;
            taskText.text = ++numberOfTask + ". "
                               + "Впишите в таблицу значение Yк с графика гистерезиса с осцилографа, при силе тока в 0.1 А. Чтобы правильно снять показания, посмотрите на доску с обозначениями.(посчитать кол-во делений и умножить на 0.2 для внесения в таблицу)";
            EventManager.WritingValue += Task5;
            Open();
            return true;
        }

        return false;
    }

    bool Task5()
    {
        if (TaskControl(1))
        {
            EventManager.WritingValue -= Task5;
            taskText.text = ++numberOfTask + ". "
                               + "Впишите в таблицу значение Хm с графика гистерезиса с осцилографа, при силе тока в 0.1 А. Чтобы правильно снять показания, посмотрите на доску с обозначениями.(посчитать кол-во делений и умножить на 0.2 для внесения в таблицу)";
            EventManager.WritingValue += Task6;
            Open(); return true;
        }

        return false;
    }

    bool Task6()
    {
        if (TaskControl(1))
        {
            EventManager.WritingValue -= Task6;
            taskText.text = ++numberOfTask + ". " + "Впишите в таблицу значение Ym с графика гистерезиса с осцилографа, при силе тока в 0.1 А. Чтобы правильно снять показания, посмотрите на доску с обозначениями.(посчитать кол-во делений и умножить на 0.2 для внесения в таблицу)";
            EventManager.WritingValue += Task7;
            Open();
            return true;
        }

        return false;
    }

    bool Task7()
    {
        if (TaskControl(1))
        {
            EventManager.WritingValue -= Task7;
            taskText.text = ++numberOfTask + ". " + "Поворотом ручки ЛАТР, установите ток в 0,2 Ампер.";
            EventManager.AmpChanger += Task8;
            Open(); return true;
        }

        return false;
    }

    void Task8(float color)
    {
        if (color == 2)
        {
            EventManager.AmpChanger -= Task8;
            taskText.text = ++numberOfTask + ". " + "Впишите в таблицу значение Xk с графика гистерезиса с осцилографа, при силе тока в 0.2 А. Чтобы правильно снять показания, посмотрите на доску с обозначениями.(посчитать кол-во делений и умножить на 0.2 для внесения в таблицу)";
            EventManager.WritingValue += Task9;
            Open();
        }
    }

    bool Task9()
    {
        if (TaskControl(2))
        {
            EventManager.WritingValue -= Task9;
            taskText.text = ++numberOfTask + ". " + "Впишите в таблицу значение Yk с графика гистерезиса с осцилографа, при силе тока в 0.2 А. Чтобы правильно снять показания, посмотрите на доску с обозначениями.(посчитать кол-во делений и умножить на 0.2 для внесения в таблицу)";
            EventManager.WritingValue += Task10;
            Open(); return true;
        }

        return false;
    }

    bool Task10()
    {
        if (TaskControl(2))
        {
            EventManager.WritingValue -= Task10;
            taskText.text = ++numberOfTask + ". " + "Впишите в таблицу значение Xm с графика гистерезиса с осцилографа, при силе тока в 0.2 А. Чтобы правильно снять показания, посмотрите на доску с обозначениями.(посчитать кол-во делений и умножить на 0.2 для внесения в таблицу)";
            EventManager.WritingValue += Task11;
            Open();
            return true;
        }

        return false;
    }

    bool Task11()
    {
        if (TaskControl(2))
        {
            EventManager.WritingValue -= Task11;
            taskText.text = ++numberOfTask + ". " + "Впишите в таблицу значение Ym с графика гистерезиса с осцилографа, при силе тока в 0.2 А. Чтобы правильно снять показания, посмотрите на доску с обозначениями.(посчитать кол-во делений и умножить на 0.2 для внесения в таблицу)";
            EventManager.WritingValue += Task12;
            Open();
            return true;
        }

        return false;
    }

    bool Task12()
    {
        if (TaskControl(2))
        {

            EventManager.WritingValue -= Task12;
            taskText.text = ++numberOfTask + ". " + "Поворотом ручки ЛАТР, установите ток в 0,3 Ампер.";
            EventManager.AmpChanger += Task13;
            Open();
            return true;
        }

        return false;
    }

    void Task13(float color)
    {
        if (color == 3)
        {
            EventManager.AmpChanger -= Task13;
            taskText.text = ++numberOfTask + ". " + "Впишите в таблицу значение Xk с графика гистерезиса с осцилографа, при силе тока в 0.3 А. Чтобы правильно снять показания, посмотрите на доску с обозначениями.(посчитать кол-во делений и умножить на 0.2 для внесения в таблицу)";
            EventManager.WritingValue += Task14;
            Open();
        }
    }

    bool Task14()
    {
        if (TaskControl(3))
        {
            EventManager.WritingValue -= Task14;
            taskText.text = ++numberOfTask + ". " + "Впишите в таблицу значение Yk с графика гистерезиса с осцилографа, при силе тока в 0.3 А. Чтобы правильно снять показания, посмотрите на доску с обозначениями.(посчитать кол-во делений и умножить на 0.2 для внесения в таблицу)";
            EventManager.WritingValue += Task15;
            Open();
            return true;
        }

        return false;
    }

    bool Task15()
    {
        if (TaskControl(3))
        {

            EventManager.WritingValue -= Task15;
            taskText.text = ++numberOfTask + ". " + "Впишите в таблицу значение Xm с графика гистерезиса с осцилографа, при силе тока в 0.3 А. Чтобы правильно снять показания, посмотрите на доску с обозначениями.(посчитать кол-во делений и умножить на 0.2 для внесения в таблицу)";
            EventManager.WritingValue += Task16;
            Open();
            return true;
        }

        return false;
    }

    bool Task16()
    {
        if (TaskControl(3))
        {

            EventManager.WritingValue -= Task16;
            taskText.text = ++numberOfTask + ". " + "Впишите в таблицу значение Ym с графика гистерезиса с осцилографа, при силе тока в 0.3 А. Чтобы правильно снять показания, посмотрите на доску с обозначениями.(посчитать кол-во делений и умножить на 0.2 для внесения в таблицу)";
            EventManager.WritingValue += Task17;
            Open();
            return true;
        }

        return false;
    }

    bool Task17()
    {
        if (TaskControl(3))
        {

            EventManager.WritingValue -= Task17;
            taskText.text = ++numberOfTask + ". " + "Поворотом ручки ЛАТР, установите ток в 0,4 Ампер.";
            EventManager.AmpChanger += Task18;
            Open();
            return true;
        }

        return false;
    }

    void Task18(float color)
    {
        if (TaskControl(4))
        {
            EventManager.AmpChanger -= Task18;
            taskText.text = ++numberOfTask + ". " + "Впишите в таблицу значение Xk с графика гистерезиса с осцилографа, при силе тока в 0.4 А. Чтобы правильно снять показания, посмотрите на доску с обозначениями.(посчитать кол-во делений и умножить на 0.2 для внесения в таблицу)";
            EventManager.WritingValue += Task19;
            Open();
        }
    }

    bool Task19()
    {
        if (TaskControl(4))
        {
            EventManager.WritingValue -= Task19;
            taskText.text = ++numberOfTask + ". " + "Впишите в таблицу значение Yk с графика гистерезиса с осцилографа, при силе тока в 0.4 А. Чтобы правильно снять показания, посмотрите на доску с обозначениями.(посчитать кол-во делений и умножить на 0.2 для внесения в таблицу)";
            EventManager.WritingValue += Task20;
            Open();
            return true;
        }

        return false;
    }

    bool Task20()
    {
        if (TaskControl(4))
        {
            EventManager.WritingValue -= Task20;
            taskText.text = ++numberOfTask + ". " + "Впишите в таблицу значение Xm с графика гистерезиса с осцилографа, при силе тока в 0.4 А. Чтобы правильно снять показания, посмотрите на доску с обозначениями.(посчитать кол-во делений и умножить на 0.2 для внесения в таблицу)";
            EventManager.WritingValue += Task21;
            Open();
            return true;
        }

        return false;
    }

    bool Task21()
    {
        if (TaskControl(4))
        {
            EventManager.WritingValue -= Task21;
            taskText.text = ++numberOfTask + ". " + "Впишите в таблицу значение Ym с графика гистерезиса с осцилографа, при силе тока в 0.4 А. Чтобы правильно снять показания, посмотрите на доску с обозначениями.(посчитать кол-во делений и умножить на 0.2 для внесения в таблицу)";
            EventManager.WritingValue += Task22;
            Open();
            return true;
        }

        return false;
    }

    bool Task22()
    {
        if (TaskControl(4))
        {
            EventManager.WritingValue -= Task22;
            taskText.text = ++numberOfTask + ". " + "Поворотом ручки ЛАТР, установите ток в 0,5 Ампер.";
            EventManager.AmpChanger += Task23;
            Open();
            return true;
        }

        return false;
    }

    void Task23(float color)
    {
        if (TaskControl(5))
        {
            EventManager.AmpChanger -= Task23;
            taskText.text = ++numberOfTask + ". " + "Впишите в таблицу значение Xk с графика гистерезиса с осцилографа, при силе тока в 0.5 А. Чтобы правильно снять показания, посмотрите на доску с обозначениями.(посчитать кол-во делений и умножить на 0.2 для внесения в таблицу)";
            EventManager.WritingValue += Task24;
            Open();
        }
    }

    bool Task24()
    {
        if (TaskControl(5))
        {
            EventManager.WritingValue -= Task24;
            taskText.text = ++numberOfTask + ". " + "Впишите в таблицу значение Yk с графика гистерезиса с осцилографа, при силе тока в 0.5 А. Чтобы правильно снять показания, посмотрите на доску с обозначениями.(посчитать кол-во делений и умножить на 0.2 для внесения в таблицу)";
            EventManager.WritingValue += Task25;
            Open();
            return true;
        }

        return false;
    }

    bool Task25()
    {
        if (TaskControl(5))
        {
            EventManager.WritingValue -= Task25;
            taskText.text = ++numberOfTask + ". " + "Впишите в таблицу значение Xm с графика гистерезиса с осцилографа, при силе тока в 0.5 А. Чтобы правильно снять показания, посмотрите на доску с обозначениями.(посчитать кол-во делений и умножить на 0.2 для внесения в таблицу)";
            EventManager.WritingValue += Task26;
            Open();
            return true;
        }

        return false;
    }

    bool Task26()
    {
        if (TaskControl(5))
        {
            EventManager.WritingValue -= Task26;
            taskText.text = ++numberOfTask + ". " + "Впишите в таблицу значение Ym с графика гистерезиса с осцилографа, при силе тока в 0.5 А. Чтобы правильно снять показания, посмотрите на доску с обозначениями.(посчитать кол-во делений и умножить на 0.2 для внесения в таблицу)";
            EventManager.WritingValue += Task27;
            Open();
            return true;
        }

        return false;
    }

    bool Task27()
    {
        if (TaskControl(5))
        {
            EventManager.WritingValue -= Task27;
            taskText.text = ++numberOfTask + ". " + "Поворотом ручки ЛАТР, установите ток в 0,6 Ампер.";
            EventManager.AmpChanger += Task28;
            Open();
            return true;
        }

        return false;
    }

    void Task28(float color)
    {
        if (TaskControl(6))
        {
            EventManager.AmpChanger -= Task28;
            taskText.text = ++numberOfTask + ". " + "Впишите в таблицу значение Xk с графика гистерезиса с осцилографа, при силе тока в 0.6 А. Чтобы правильно снять показания, посмотрите на доску с обозначениями.(посчитать кол-во делений и умножить на 0.2 для внесения в таблицу)";
            EventManager.WritingValue += Task29;
            Open();
        }
    }

    bool Task29()
    {
        if (TaskControl(6))
        {
            EventManager.WritingValue -= Task29;
            taskText.text = ++numberOfTask + ". " + "Впишите в таблицу значение Yk с графика гистерезиса с осцилографа, при силе тока в 0.6 А. Чтобы правильно снять показания, посмотрите на доску с обозначениями.(посчитать кол-во делений и умножить на 0.2 для внесения в таблицу)";
            EventManager.WritingValue += Task30;
            Open();
            return true;
        }

        return false;
    }

    bool Task30()
    {
        if (TaskControl(6))
        {
            EventManager.WritingValue -= Task30;
            taskText.text = ++numberOfTask + ". " + "Впишите в таблицу значение Xm с графика гистерезиса с осцилографа, при силе тока в 0.6 А. Чтобы правильно снять показания, посмотрите на доску с обозначениями.(посчитать кол-во делений и умножить на 0.2 для внесения в таблицу)";
            EventManager.WritingValue += Task31;
            Open();
            return true;
        }

        return false;
    }

    bool Task31()
    {
        if (TaskControl(6))
        {
            EventManager.WritingValue -= Task31;
            taskText.text = ++numberOfTask + ". " + "Впишите в таблицу значение Ym с графика гистерезиса с осцилографа, при силе тока в 0.6 А. Чтобы правильно снять показания, посмотрите на доску с обозначениями.(посчитать кол-во делений и умножить на 0.2 для внесения в таблицу)";
            EventManager.WritingValue += Task32;
            Open();
            return true;
        }

        return false;
    }

    bool Task32()
    {
        if (TaskControl(6))
        {
            EventManager.WritingValue -= Task32;
            taskText.text = ++numberOfTask + ". " + "Отлично, все измерения сняты. Теперь ознакомтесь с результатами измерений в таблице и проведите их анализ, а также подготовьте выводы в соответствии с целью работы.";
            Open();
            return true;
        }
        else return false;
    }

    bool TaskControl(float color)
    {
        if (!isWorking)
        {
            string temporaryText = "";
            if (!wasTaskControl)
            {
                temporaryText = taskText.text;
                temporaryText = temporaryText.ToLower();
                temporaryText = temporaryText.Substring(3);
                wasTaskControl = true;
            }

            taskText.text = "Включите установку, а затем " + temporaryText;
            return false;
        }

        else if (color != null)
        {
            if (color == currentColor)
            {
                wasTaskControl = false;
                return true;
            }
            else
            {
                string temporaryText = "";
                if (!wasTaskControl)
                {
                    temporaryText = taskText.text;
                    temporaryText = temporaryText.ToLower();
                    temporaryText = temporaryText.Substring(3);
                    wasTaskControl = true;
                    taskText.text = "Включите " + NameOfColor(color) + " на ЛАТР и " + temporaryText;
                }

                return false;
            }
        }

        else
        {
            wasTaskControl = false;
            return true;
        }
    }


    public void Open()
    {
        myimage.enabled = true;
        taskText.enabled = true;
        nameOfColor.enabled = true;
        addButton.GetComponent<Image>().enabled = true;
        tableButton.GetComponent<Image>().enabled = true;
        clearTableButton.GetComponent<Image>().enabled = true;
        addButtonImage.enabled = true;
        tableButtonImage.enabled = true;
        clearTableButtonImage.enabled = true;
        inputArea.SetActive(true);
    }

    public void Close()
    {
        myimage.enabled = false;
        taskText.enabled = false;
        nameOfColor.enabled = false;
        addButton.GetComponent<Image>().enabled = false;
        tableButton.GetComponent<Image>().enabled = false;
        clearTableButton.GetComponent<Image>().enabled = false;
        addButtonImage.enabled = false;
        tableButtonImage.enabled = false;
        clearTableButtonImage.enabled = false;
        inputArea.SetActive(false);
    }
    public void ResetTasks()
    {
        EventManager.SwitchWork(false);
        numberOfTask = 0;
        taskText.text = ++numberOfTask + ". " + "Включите установку";
        EventManager.Switch += Task1;
    }

}
